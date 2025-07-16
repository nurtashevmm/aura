const { exec } = require('child_process');
const treeKill = require('tree-kill');

const port = 3000;

const killer = exec(`lsof -i :${port} -t`, (err, stdout, stderr) => {
  if (stdout) {
    const pid = parseInt(stdout.trim());
    treeKill(pid, 'SIGKILL', (err) => {
      if (err) {
        console.error(`Failed to kill process ${pid}:`, err);
      } else {
        console.log(`Killed process ${pid}`);
      }
      startServer();
    });
  } else {
    startServer();
  }
});

function startServer() {
  const server = exec('next dev');
  server.stdout.pipe(process.stdout);
  server.stderr.pipe(process.stderr);
}