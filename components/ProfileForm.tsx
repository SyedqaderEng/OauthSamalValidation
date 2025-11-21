'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setSuccess(true);
        setIsEditing(false);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div>
        <label className="text-sm text-gray-400 block mb-2">Display Name</label>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-pink-500/50"
          />
        ) : (
          <div className="px-4 py-2 text-sm">{user.name || <span className="text-gray-500">Not set</span>}</div>
        )}
      </div>

      {/* Email Field (Read-only) */}
      <div>
        <label className="text-sm text-gray-400 block mb-2">Email Address</label>
        <div className="flex items-center gap-2">
          <input
            type="email"
            value={user.email}
            disabled
            className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm cursor-not-allowed opacity-60"
          />
          <span className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
            Cannot be changed
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✓ Profile updated successfully!
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 transition font-semibold text-sm"
            >
              {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition font-semibold text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition font-semibold text-sm"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
