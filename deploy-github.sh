#!/bin/bash

# GitHub Pages Deployment Script for ChemLab Virtual

echo "🚀 Building ChemLab Virtual for GitHub Pages..."

# Build the project
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "📦 Build completed successfully!"

# Clean up existing GitHub Pages files at root
echo "🧹 Cleaning up existing deployment files..."
rm -f index.html
rm -rf assets/

# Copy built files to root for GitHub Pages
echo "📂 Copying built files to root level..."
cp dist/public/index.html .
cp -r dist/public/assets .

if [ -f "index.html" ] && [ -d "assets" ]; then
    echo "✅ Files copied successfully!"
    echo "📁 Root structure now contains:"
    echo "   ├── index.html  ✅"
    echo "   ├── assets/     ✅"
    echo "   └── ..."
    echo ""
    echo "🌐 Ready for GitHub Pages deployment!"
    echo "💡 Commit and push these changes to deploy to:"
    echo "   https://tangytongues.github.io/tinkerlab/"
else
    echo "❌ Failed to copy files to root!"
    exit 1
fi
