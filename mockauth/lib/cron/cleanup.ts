import cron from 'node-cron';
import prisma from '@/lib/prisma';
import { EmailService } from '@/lib/email/service';
import { SAMLService } from '@/lib/saml/service';

export class CleanupService {
  private static isRunning = false;

  /**
   * Start the cleanup cron job
   */
  static start(): void {
    if (!process.env.CLEANUP_ENABLED || process.env.CLEANUP_ENABLED === 'false') {
      console.log('Cleanup cron job is disabled');
      return;
    }

    const schedule = process.env.CLEANUP_CRON || '0 2 * * *'; // Default: daily at 2 AM

    cron.schedule(schedule, async () => {
      if (this.isRunning) {
        console.log('Cleanup job already running, skipping...');
        return;
      }

      this.isRunning = true;
      try {
        console.log('Starting cleanup job...');
        await this.runCleanup();
        console.log('Cleanup job completed');
      } catch (error) {
        console.error('Cleanup job failed:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log(`Cleanup cron job started with schedule: ${schedule}`);
  }

  /**
   * Run the cleanup process
   */
  static async runCleanup(): Promise<void> {
    const now = new Date();

    // Step 1: Send warning emails for resources expiring in 3 days
    await this.sendExpiryWarnings(3);

    // Step 2: Send final notification for resources expiring today
    await this.sendFinalNotifications();

    // Step 3: Soft delete expired resources
    await this.softDeleteExpiredResources();

    // Step 4: Hard delete resources that were soft-deleted 90 days ago
    await this.hardDeleteOldResources();

    // Step 5: Clean up expired OAuth tokens
    await this.cleanupExpiredTokens();

    // Step 6: Clean up expired SAML sessions
    await this.cleanupExpiredSessions();
  }

  private static async sendExpiryWarnings(daysUntilExpiry: number): Promise<void> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntilExpiry);
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find OAuth apps expiring soon
    const oauthApps = await prisma.oAuthApp.findMany({
      where: {
        expiresAt: {
          gte: targetDate,
          lt: nextDay,
        },
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });

    // Find SAML environments expiring soon
    const samlEnvs = await prisma.samlEnvironment.findMany({
      where: {
        expiresAt: {
          gte: targetDate,
          lt: nextDay,
        },
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });

    // Group by user and send emails
    const userResources = new Map<string, any>();

    oauthApps.forEach(app => {
      if (!userResources.has(app.userId)) {
        userResources.set(app.userId, {
          user: app.user,
          resources: [],
        });
      }

      userResources.get(app.userId)!.resources.push({
        type: 'OAuth App',
        name: app.name,
        expiresAt: app.expiresAt,
      });
    });

    samlEnvs.forEach(env => {
      if (!userResources.has(env.userId)) {
        userResources.set(env.userId, {
          user: env.user,
          resources: [],
        });
      }

      // Generate metadata as backup
      const metadata = SAMLService.generateIdPMetadata(env);

      userResources.get(env.userId)!.resources.push({
        type: 'SAML Environment',
        name: env.name,
        expiresAt: env.expiresAt,
        metadata,
      });
    });

    // Send warning emails
    for (const [userId, data] of userResources) {
      try {
        await EmailService.sendExpiryWarningEmail({
          email: data.user.email,
          name: data.user.name || 'User',
          resources: data.resources,
          daysUntilExpiry,
        });
      } catch (error) {
        console.error(`Failed to send warning email to ${data.user.email}:`, error);
      }
    }

    console.log(`Sent ${userResources.size} expiry warning emails`);
  }

  private static async sendFinalNotifications(): Promise<void> {
    // Implementation similar to sendExpiryWarnings but for day 0
    // Omitted for brevity
  }

  private static async softDeleteExpiredResources(): Promise<void> {
    const now = new Date();

    // Soft delete expired OAuth apps
    const deletedOAuth = await prisma.oAuthApp.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });

    // Soft delete expired SAML environments
    const deletedSAML = await prisma.samlEnvironment.updateMany({
      where: {
        expiresAt: {
          lt: now,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: now,
      },
    });

    console.log(`Soft deleted ${deletedOAuth.count} OAuth apps and ${deletedSAML.count} SAML environments`);
  }

  private static async hardDeleteOldResources(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    // Hard delete old OAuth apps
    const deletedOAuth = await prisma.oAuthApp.deleteMany({
      where: {
        deletedAt: {
          lt: cutoffDate,
        },
      },
    });

    // Hard delete old SAML environments
    const deletedSAML = await prisma.samlEnvironment.deleteMany({
      where: {
        deletedAt: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`Hard deleted ${deletedOAuth.count} OAuth apps and ${deletedSAML.count} SAML environments`);
  }

  private static async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    const deleted = await prisma.oAuthToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    console.log(`Deleted ${deleted.count} expired OAuth tokens`);
  }

  private static async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();

    const deleted = await prisma.samlSession.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    console.log(`Deleted ${deleted.count} expired SAML sessions`);
  }

  /**
   * Manual cleanup trigger (for testing or API endpoint)
   */
  static async runManual(): Promise<{ message: string; stats: any }> {
    await this.runCleanup();

    return {
      message: 'Cleanup completed successfully',
      stats: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
