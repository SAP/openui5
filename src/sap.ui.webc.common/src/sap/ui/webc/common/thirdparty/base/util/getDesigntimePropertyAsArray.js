sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  var _default = value => {
    const m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(value);
    return m && m[2] ? m[2].split(/,/) : null;
  };
  _exports.default = _default;
});