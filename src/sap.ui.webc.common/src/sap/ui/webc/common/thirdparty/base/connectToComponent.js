sap.ui.define(["exports", "./Render"], function (_exports, _Render) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const MISSING_ELEMENT_POLL_TIMEOUT = 500; // how often to poll for not-yet-in-DOM friend elements
  const connections = new Map();
  const intervals = new Map();
  const connectToComponent = options => {
    const host = options.host;
    const propName = options.propName;
    const friend = host[propName];
    let connectedTo;
    if (friend === undefined || friend === "") {
      connectedTo = undefined; // do not return early even if a "menu" property is not set - it may have been set before and cleanup must run
    } else if (friend instanceof HTMLElement) {
      connectedTo = friend;
    } else {
      const rootNode = host.getRootNode();
      connectedTo = rootNode.getElementById && rootNode.getElementById(friend) || undefined;
    }
    const key = `${host._id}-${propName}`;
    const prevConnectedTo = connections.get(key);
    // Not connected - return undefined
    if (!connectedTo) {
      if (prevConnectedTo) {
        // but first disconnect, if needed
        options.onDisconnect && options.onDisconnect(prevConnectedTo);
        connections.delete(key);
      }
      // if friend element not in DOM yet, start polling
      if (typeof friend === "string" && friend && !intervals.has(key)) {
        const interval = setInterval(() => {
          const rootNode = host.getRootNode();
          const found = rootNode.getElementById && rootNode.getElementById(friend);
          if (found) {
            clearInterval(intervals.get(key));
            intervals.delete(key);
            (0, _Render.renderDeferred)(host);
          }
        }, MISSING_ELEMENT_POLL_TIMEOUT);
        intervals.set(key, interval);
      }
      return;
    }
    // If connected, but still polling, stop polling
    if (intervals.has(key)) {
      clearInterval(intervals.get(key));
      intervals.delete(key);
    }
    // Connected - either for the first time, or to something else
    if (prevConnectedTo !== connectedTo) {
      if (prevConnectedTo) {
        options.onDisconnect && options.onDisconnect(prevConnectedTo);
      }
      options.onConnect && options.onConnect(connectedTo);
      connections.set(key, connectedTo);
    }
    return connections.get(key);
  };
  var _default = connectToComponent;
  _exports.default = _default;
});