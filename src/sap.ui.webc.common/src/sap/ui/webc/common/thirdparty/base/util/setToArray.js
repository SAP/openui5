sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  // This is needed as IE11 doesn't have Set.prototype.keys/values/entries, so [...mySet.values()] is not an option
  const setToArray = s => {
    const arr = [];
    s.forEach(item => {
      arr.push(item);
    });
    return arr;
  };
  var _default = setToArray;
  _exports.default = _default;
});