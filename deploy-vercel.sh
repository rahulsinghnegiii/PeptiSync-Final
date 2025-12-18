#!/bin/bash

# PeptiSync Vercel Deployment Script
# This script helps you deploy PeptiSync to Vercel quickly

echo "🚀 PeptiSync Vercel Deployment Script"
echo "======================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI found"
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "⚠️  You have uncommitted changes. Commit them first:"
    echo ""
    git status -s
    echo ""
    read -p "Do you want to commit all changes now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "⚠️  Please commit your changes before deploying"
        exit 1
    fi
else
    echo "✅ No uncommitted changes"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Are you in the project root?"
    exit 1
fi
echo "✅ package.json found"

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Configuration missing!"
    exit 1
fi
echo "✅ vercel.json found"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies installed"
fi

echo ""
echo "🔧 Building project locally to check for errors..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🌐 Ready to deploy!"
echo ""
echo "Choose deployment type:"
echo "1) Production deployment (main site)"
echo "2) Preview deployment (testing)"
echo ""
read -p "Enter choice (1 or 2): " -n 1 -r
echo ""

if [[ $REPLY == "1" ]]; then
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    echo ""
    vercel --prod
elif [[ $REPLY == "2" ]]; then
    echo ""
    echo "🔍 Creating PREVIEW deployment..."
    echo ""
    vercel
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test your deployed site"
echo "2. Update Supabase allowed URLs"
echo "3. Configure custom domain (optional)"
echo "4. Set up monitoring and analytics"
echo ""
echo "📖 See VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""

