const { spawn } = require('child_process');
const path = require('path');

console.log("\x1b[36m%s\x1b[0m", "🚀 WordAI Platform Environment Launcher...");

function killExistingServer() {
  return new Promise((resolve) => {
    console.log("\x1b[33m%s\x1b[0m", "🔍 Checking for existing processes on port 49100...");
    const checkProcess = spawn('cmd.exe', ['/c', 'netstat -ano | findstr :49100'], {
      shell: true,
      windowsHide: true
    });

    let output = '';
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    checkProcess.on('close', () => {
      const lines = output.split('\n');
      let pidsToKill = [];
      for (const line of lines) {
        const match = line.match(/LISTENING\s+(\d+)/);
        if (match) {
          pidsToKill.push(match[1]);
        }
      }
      
      if (pidsToKill.length > 0) {
        const uniquePids = [...new Set(pidsToKill)];
        console.log(`💥 Port 49100 is busy. Killing existing processes: ${uniquePids.join(', ')}`);
        for (const pid of uniquePids) {
          spawn('cmd.exe', ['/c', `taskkill /F /PID ${pid}`], {
            shell: true,
            windowsHide: true
          });
        }
        setTimeout(resolve, 1200);
      } else {
        console.log("✅ Port 49100 is free!");
        resolve();
      }
    });

    checkProcess.on('error', () => resolve());
  });
}

async function start() {
  // Gracefully clean up any dead server processes left on port 49100
  await killExistingServer();

  console.log("\x1b[35m%s\x1b[0m", "🤖 Starting local OpenCode server on port 49100...");
  
  // Launch opencode serve to act as a robust headless AI endpoint
  const opencodeProcess = spawn('cmd.exe', [
    '/c', 'call', 'C:\\Users\\Eliandro\\AppData\\Roaming\\npm\\opencode.cmd', 'serve', '--port', '49100'
  ], {
    stdio: 'pipe',
    shell: true
  });

  opencodeProcess.stdout.on('data', (data) => {
    const msg = data.toString();
    // Only forward relevant server info or ready state messages to avoid clutter
    if (msg.includes('listening on') || msg.includes('ready') || msg.includes('OpenCode')) {
      process.stdout.write(`\x1b[35m[OpenCode]\x1b[0m ${msg}`);
    }
  });

  opencodeProcess.stderr.on('data', (data) => {
    process.stderr.write(`\x1b[31m[OpenCode Error]\x1b[0m ${data.toString()}`);
  });

  opencodeProcess.on('error', (err) => {
    console.log("\x1b[31m%s\x1b[0m", `❌ Failed to start OpenCode: ${err.message}`);
  });

  console.log("\x1b[32m%s\x1b[0m", "⚡ Starting Next.js Dev Server with Turbopack...");
  
  // Launch the Next.js frontend application
  const nextProcess = spawn('npx', ['next', 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  const cleanup = () => {
    if (opencodeProcess && !opencodeProcess.killed) {
      console.log("\n\x1b[33mStopping OpenCode server...\x1b[0m");
      opencodeProcess.kill();
    }
    if (nextProcess && !nextProcess.killed) {
      nextProcess.kill();
    }
  };

  nextProcess.on('exit', (code) => {
    cleanup();
    process.exit(code);
  });

  process.on('SIGINT', () => {
    cleanup();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    cleanup();
    process.exit(0);
  });
}

start();
