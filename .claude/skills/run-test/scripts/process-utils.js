"use strict";

const { execFileSync, execSync } = require("child_process");
const net = require("net");

function isProcessAlive(pid) {
  if (!pid) return false;
  if (process.platform === "win32") {
    try {
      const out = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/NH"],
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000, windowsHide: true });
      return out.includes(String(pid));
    } catch { return false; }
  }
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function killByPid(pid) {
  if (!pid) return;
  try {
    if (process.platform === "win32") {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: "ignore", windowsHide: true, timeout: 10000 });
    } else {
      try { process.kill(-pid, "SIGTERM"); } catch { process.kill(pid, "SIGTERM"); }
    }
  } catch { /* process may already be gone */ }
}

function killByPort(port) {
  if (!port) return;
  try {
    for (const pid of getPortPids(port)) {
      try { killByPid(pid); } catch {}
    }
  } catch { /* nothing listening or command failed */ }
}

function getPortPids(port) {
  if (!port) return [];
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000, windowsHide: true });
      const pids = [];
      for (const line of out.trim().split("\n")) {
        const pid = parseInt(line.trim().split(/\s+/).pop(), 10);
        if (pid > 0) pids.push(pid);
      }
      return pids;
    } else {
      const out = execSync(`lsof -ti :${port}`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 }).trim();
      return out.split("\n").filter(Boolean).map(p => parseInt(p, 10)).filter(p => p > 0);
    }
  } catch { return []; }
}

function getPortPid(port) {
  if (!port) return null;
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000, windowsHide: true });
      for (const line of out.trim().split("\n")) {
        const parts = line.trim().split(/\s+/);
        if (parts[1] && parts[1].endsWith(":" + port)) {
          const pid = parseInt(parts[parts.length - 1], 10);
          if (pid > 0) return pid;
        }
      }
    } else {
      const out = execSync(`lsof -ti :${port}`,
        { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 5000 }).trim();
      const pid = parseInt(out.split("\n")[0], 10);
      if (pid > 0) return pid;
    }
  } catch { /* nothing listening */ }
  return null;
}

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true));
    server.once("listening", () => { server.close(); resolve(false); });
    server.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (!(await isPortInUse(port))) return port;
  }
  throw new Error(`No available port found in range ${startPort}-${startPort + 99}`);
}

module.exports = {
  isProcessAlive,
  killByPid,
  killByPort,
  getPortPid,
  isPortInUse,
  findAvailablePort
};
