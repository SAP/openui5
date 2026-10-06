// cdp-client.js — Chrome DevTools Protocol client for headless Chrome.
"use strict";

const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn: spawnChild } = require("child_process");
const { killByPid } = require("./process-utils");

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpGetJSON(url, timeoutMs) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: timeoutMs }, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

function findChrome() {
  const candidates = process.platform === "win32"
    ? [
        "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe"
      ]
    : [
        "/usr/bin/google-chrome",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      ];
  for (const c of candidates) {
    try { fs.accessSync(c, fs.constants.X_OK); return c; } catch {}
  }
  return null;
}

class CDPClient {
  constructor() {
    this._msgId = 0;
    this._pending = new Map();
    this._events = new Map();
    this._ws = null;
    this._chrome = null;
    this._tmpDir = null;
  }

  async launch(port) {
    const chrome = findChrome();
    if (!chrome) { throw new Error("Chrome not found"); }

    this._tmpDir = path.join(os.tmpdir(), "cdp-ui5-" + Date.now());
    fs.mkdirSync(this._tmpDir, { recursive: true });

    this._chrome = spawnChild(chrome, [
      "--headless",
      "--remote-debugging-port=" + port,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--window-size=1600,1000",
      "--force-device-scale-factor=1",
      "--lang=en",
      "--user-data-dir=" + this._tmpDir,
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-background-timer-throttling",
    ], { stdio: "ignore", windowsHide: true });

    // Poll for CDP endpoint
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      try {
        const info = await httpGetJSON(`http://127.0.0.1:${port}/json/version`, 2000);
        return info;
      } catch {}
    }
    throw new Error("Chrome did not start within 10s");
  }

  async connect(wsUrl) {
    this._ws = new globalThis.WebSocket(wsUrl);

    this._ws.addEventListener("message", ev => {
      const msg = JSON.parse(typeof ev.data === "string" ? ev.data : ev.data.toString());
      if (msg.id && this._pending.has(msg.id)) {
        this._pending.get(msg.id)(msg);
        this._pending.delete(msg.id);
      }
      if (msg.method) {
        const key = msg.method + "|" + (msg.sessionId || "");
        const handler = this._events.get(key);
        if (handler) handler(msg.params);

        // Also fire session-agnostic handlers
        const globalKey = msg.method + "|";
        const globalHandler = this._events.get(globalKey);
        if (globalHandler && key !== globalKey) globalHandler(msg.params, msg.sessionId);
      }
    });

    await new Promise((resolve, reject) => {
      this._ws.addEventListener("open", resolve);
      this._ws.addEventListener("error", reject);
    });
  }

  send(method, params, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++this._msgId;
      const msg = { id, method, params: params || {} };
      if (sessionId) msg.sessionId = sessionId;
      this._pending.set(id, resolve);
      this._ws.send(JSON.stringify(msg));
      setTimeout(() => {
        if (this._pending.has(id)) {
          this._pending.delete(id);
          reject(new Error("CDP timeout: " + method));
        }
      }, 30000);
    });
  }

  on(event, handler, sessionId) {
    this._events.set(event + "|" + (sessionId || ""), handler);
  }

  off(event, sessionId) {
    this._events.delete(event + "|" + (sessionId || ""));
  }

  cleanup() {
    try { if (this._ws) this._ws.close(); } catch {}
    if (this._chrome) {
      // killByPid kills the entire process tree on Windows (taskkill /F /T),
      // preventing orphaned renderer/GPU processes that would block ports.
      try { killByPid(this._chrome.pid); } catch {}
    }
    if (this._tmpDir) {
      // Give Chrome time to release file handles before cleanup
      setTimeout(() => {
        try { fs.rmSync(this._tmpDir, { recursive: true, force: true }); } catch {}
      }, 2000);
    }
  }
}

module.exports = { CDPClient, findChrome, httpGetJSON, sleep };
