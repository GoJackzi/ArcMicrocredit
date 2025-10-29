import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileWithSolc() {
  console.log('🔨 Compiling contracts with solc...\n');

  // Try to use forge if available
  try {
    console.log('Attempting to use forge...');
    execSync('forge build', { cwd: __dirname, stdio: 'inherit' });
    console.log('✅ Compilation successful with forge!\n');
    return true;
  } catch (error) {
    console.log('⚠️  forge not available, trying solc...\n');
  }

  // Fallback: Use solc directly
  const solcPath = path.join(__dirname, 'node_modules', '.bin', 'solcjs');
  
  if (!fs.existsSync(solcPath)) {
    console.error('❌ solc not found. Trying global installation...');
    try {
      execSync('npm install -g solc', { stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Could not install solc. Please install Foundry or solc manually.');
      console.error('\n📋 Instructions:');
      console.error('   1. Install Foundry: curl -L https://foundry.paradigm.xyz | bash (Linux/WSL)');
      console.error('   2. Or use WSL and run: forge build');
      console.error('   3. Or compile via Remix IDE at https://remix.ethereum.org');
      process.exit(1);
    }
  }

  console.error('❌ Direct solc compilation is complex. Please use one of:');
  console.error('   1. Install Foundry and run: forge build');
  console.error('   2. Use WSL: wsl bash -c "cd /mnt/g/Arc-Microcredit-Protocol/backend && forge build"');
  console.error('   3. Use Remix IDE to compile, then copy artifacts to out/');
  
  return false;
}

compileWithSolc().then(success => {
  if (success) {
    console.log('✅ Ready to deploy! Run: node deploy.js');
  }
}).catch(error => {
  console.error('❌ Compilation failed:', error.message);
  process.exit(1);
});

