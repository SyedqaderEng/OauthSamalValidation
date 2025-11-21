#!/bin/bash

echo "🚀 SAML Test Platform - Setup Script"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose -f docker-compose.saml.yml down -v

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose -f docker-compose.saml.yml up -d --build

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check if services are running
if docker ps | grep -q saml_backend; then
    echo "✅ Backend is running"
else
    echo "❌ Backend failed to start"
    exit 1
fi

if docker ps | grep -q saml_frontend; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

if docker ps | grep -q saml_postgres; then
    echo "✅ Database is running"
else
    echo "❌ Database failed to start"
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3002"
echo "   Backend:  http://localhost:3001"
echo "   API Docs: http://localhost:3001"
echo ""
echo "🔐 SAML Endpoints:"
echo "   SP Metadata:  http://localhost:3001/saml/metadata"
echo "   IdP Metadata: http://localhost:3001/saml/idp/metadata"
echo ""
echo "📝 Next steps:"
echo "   1. Open http://localhost:3002 in your browser"
echo "   2. Click 'Sign up' to create an account"
echo "   3. Import SAML metadata from the dashboard"
echo "   4. Test SAML flows in the SAML Console"
echo ""
echo "📚 For more information, see SAML_PLATFORM_README.md"
echo ""
echo "🛑 To stop the platform: docker-compose -f docker-compose.saml.yml down"
echo ""
