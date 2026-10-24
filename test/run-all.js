import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');

async function checkServerRunning() {
  try {
    const res = await fetch('http://localhost:3001/api/health', { signal: AbortSignal.timeout(1000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: ROOT_DIR,
      stdio: 'inherit'
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Script ${path.basename(scriptPath)} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log('🏁 ============================================');
  console.log('   Crazy Crunch Test & Verification Suite');
  console.log('============================================\n');

  // Step 1: Run Verify Unit / Logic Suite
  console.log('▶️ Step 1/2: Running Core Suite (test/verify.js)...\n');
  await runScript(path.join(__dirname, 'verify.js'));

  // Step 2: Check / Start Server for E2E Suite
  console.log('\n▶️ Step 2/2: Running Full-Stack E2E Suite (test/e2e-http.js)...\n');
  const alreadyRunning = await checkServerRunning();
  let serverProcess = null;

  if (!alreadyRunning) {
    console.log('⚙️ Starting local Crazy Crunch server on port 3001...');
    serverProcess = spawn(process.execPath, [path.join(ROOT_DIR, 'server', 'index.js')], {
      cwd: ROOT_DIR,
      stdio: 'pipe'
    });

    serverProcess.stderr.on('data', (d) => {
      const msg = d.toString();
      if (!msg.includes('ExperimentalWarning')) {
        process.stderr.write(msg);
      }
    });

    // Wait for server to become responsive
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 200));
      if (await checkServerRunning()) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      if (serverProcess) serverProcess.kill();
      throw new Error('Failed to start server within 6 seconds.');
    }
    console.log('✅ Server ready on http://localhost:3001\n');
  } else {
    console.log('ℹ️ Server already active on http://localhost:3001\n');
  }

  try {
    await runScript(path.join(__dirname, 'e2e-http.js'));
  } finally {
    if (serverProcess) {
      console.log('🛑 Shutting down temporary background server...');
      serverProcess.kill();
    }
  }

  console.log('\n🎉 ALL TEST SUITES PASSED CLEANLY!\n');
}

main().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err.message);
  process.exit(1);
});
