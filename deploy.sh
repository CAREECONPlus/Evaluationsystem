#!/bin/bash

# Firebase Hosting Deploy Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Firebase Hosting deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please log in to Firebase..."
    firebase login
fi

# Set project
echo "📋 Setting Firebase project..."
firebase use hyouka-db

# Deploy to hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed!"
echo "📍 Your app is live at:"
echo "   Primary: https://hyouka-db.web.app"
echo "   Alternative: https://hyouka-db.firebaseapp.com"