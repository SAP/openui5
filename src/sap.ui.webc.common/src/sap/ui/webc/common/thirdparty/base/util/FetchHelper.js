sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fetchTextOnce = _exports.fetchJsonOnce = void 0;
  const fetchPromises = new Map();
  const jsonPromises = new Map();
  const textPromises = new Map();
  const fetchTextOnce = async url => {
    if (!fetchPromises.get(url)) {
      fetchPromises.set(url, fetch(url));
    }
    const response = await fetchPromises.get(url);
    if (response && !textPromises.get(url)) {
      textPromises.set(url, response.text());
    }
    return textPromises.get(url);
  };
  _exports.fetchTextOnce = fetchTextOnce;
  const fetchJsonOnce = async url => {
    if (!fetchPromises.get(url)) {
      fetchPromises.set(url, fetch(url));
    }
    const response = await fetchPromises.get(url);
    if (response && !jsonPromises.get(url)) {
      jsonPromises.set(url, response.json());
    }
    return jsonPromises.get(url);
  };
  _exports.fetchJsonOnce = fetchJsonOnce;
});