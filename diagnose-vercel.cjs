#!/usr/bin/env node

/**
 * Vercel Deployment Diagnostic Script
 * 
 * This script helps diagnose why your Vercel deployment shows a blank page
 * Run this locally to check your configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PeptiSync Vercel Deployment Diagnostic\n');
console.log('=' .repeat(60));

// Check 1: Verify vercel.json exists and is valid
console.log('\n📄 Checking vercel.json...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json exists and is valid JSON');
  console.log('   - Build command:', vercelConfig.buildCommand);
  console.log('   - Output directory:', vercelConfig.outputDirectory);
  console.log('   - Framework:', vercelConfig.framework);
  
  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    console.log('✅ SPA routing configured correctly');
  } else {
    console.log('⚠️  No rewrites found - SPA routing may not work');
  }
} catch (error) {
  console.log('❌ Error reading vercel.json:', error.message);
}

// Check 2: Verify package.json build script
console.log('\n📦 Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log('✅ package.json exists');
  console.log('   - Build script:', packageJson.scripts?.build || 'NOT FOUND');
  
  if (!packageJson.scripts?.build) {
    console.log('❌ No build script found in package.json');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check 3: Verify critical files exist
console.log('\n📁 Checking critical files...');
const criticalFiles = [
  'index.html',
  'src/main.tsx',
  'src/App.tsx',
  'src/integrations/supabase/client.ts',
  'vite.config.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} NOT FOUND`);
  }
});

// Check 4: Check for .env file (should NOT be committed)
console.log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env')) {
  console.log('⚠️  .env file found locally');
  console.log('   This file should NOT be committed to Git');
  console.log('   Environment variables must be set in Vercel Dashboard');
  
  // Read .env and show which variables are set
  const envContent = fs.readFileSync('.env', 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=')[0]);
  
  console.log('\n   Local environment variables found:');
  envVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log('\n   ⚠️  IMPORTANT: These must be added to Vercel Dashboard!');
} else {
  console.log('✅ No .env file found (good - it should not be committed)');
}

// Check 5: Verify .gitignore
console.log('\n🚫 Checking .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env')) {
    console.log('✅ .env is in .gitignore (good)');
  } else {
    console.log('⚠️  .env is NOT in .gitignore - add it!');
  }
  
  if (gitignore.includes('dist')) {
    console.log('✅ dist is in .gitignore (good)');
  } else {
    console.log('⚠️  dist is NOT in .gitignore - add it!');
  }
} else {
  console.log('❌ No .gitignore file found');
}

// Check 6: Analyze Supabase client initialization
console.log('\n🔌 Checking Supabase client configuration...');
try {
  const supabaseClient = fs.readFileSync('src/integrations/supabase/client.ts', 'utf8');
  
  if (supabaseClient.includes('import.meta.env.VITE_SUPABASE_URL')) {
    console.log('✅ Using VITE_SUPABASE_URL environment variable');
  }
  
  if (supabaseClient.includes('import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY')) {
    console.log('✅ Using VITE_SUPABASE_PUBLISHABLE_KEY environment variable');
  }
  
  if (supabaseClient.includes('throw new Error')) {
    console.log('⚠️  Client throws error if environment variables are missing');
    console.log('   This is why you see a blank page if variables are not set!');
  }
} catch (error) {
  console.log('❌ Error reading Supabase client:', error.message);
}

// Check 7: Test build locally
console.log('\n🏗️  Build test recommendations...');
console.log('To test the production build locally:');
console.log('   1. npm run build');
console.log('   2. npm run preview');
console.log('   3. Open http://localhost:4173');
console.log('   4. Check browser console for errors');

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY & NEXT STEPS\n');

console.log('If you see a blank page on Vercel, the most likely cause is:');
console.log('❌ Missing environment variables in Vercel Dashboard\n');

console.log('Required environment variables for Vercel:');
console.log('   1. VITE_SUPABASE_URL');
console.log('   2. VITE_SUPABASE_PUBLISHABLE_KEY');
console.log('   3. VITE_STRIPE_PUBLISHABLE_KEY');
console.log('   4. VITE_APP_URL\n');

console.log('How to fix:');
console.log('   1. Go to Vercel Dashboard → Your Project → Settings');
console.log('   2. Click "Environment Variables"');
console.log('   3. Add all 4 variables above');
console.log('   4. Check ALL environments (Production, Preview, Development)');
console.log('   5. Redeploy WITHOUT cache\n');

console.log('For detailed instructions, see:');
console.log('   - VERCEL_BLANK_PAGE_RESEARCH.md (comprehensive analysis)');
console.log('   - VERCEL_TROUBLESHOOTING.md (quick fixes)');
console.log('   - VERCEL_ENV_SETUP.md (environment variable setup)\n');

console.log('=' .repeat(60));
console.log('✨ Diagnostic complete!\n');

