import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PING_SCRIPT = path.join(__dirname, 'ping.js');
const INTERVAL_HOURS = 6;
const INTERVAL_MS = INTERVAL_HOURS * 60 * 60 * 1000;

function runPing() {
  console.log(`[${new Date().toISOString()}] Starting scheduled ping...`);
  const child = spawn('node', [PING_SCRIPT], {
    stdio: 'inherit',
    env: { ...process.env, RANDOM_DELAY: 'true' }
  });

  child.on('close', (code) => {
    console.log(`[${new Date().toISOString()}] Ping process exited with code ${code}`);
  });
}

// Run immediately on start
runPing();

// Then schedule
setInterval(runPing, INTERVAL_MS);

console.log(`[${new Date().toISOString()}] Scheduler started. Pinging every ${INTERVAL_HOURS} hours.`);
