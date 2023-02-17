sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.StartsWithPerTerm = _exports.StartsWith = _exports.None = _exports.Contains = void 0;
  const escapeReg = /[[\]{}()*+?.\\^$|]/g;
  const escapeRegExp = str => {
    return str.replace(escapeReg, "\\$&");
  };
  const StartsWithPerTerm = (value, items, propName) => {
    const reg = new RegExp(`(^|\\s)${escapeRegExp(value.toLowerCase())}.*`, "g");
    return items.filter(item => {
      const text = item[propName];
      reg.lastIndex = 0;
      return reg.test(text.toLowerCase());
    });
  };
  _exports.StartsWithPerTerm = StartsWithPerTerm;
  const StartsWith = (value, items, propName) => items.filter(item => item[propName].toLowerCase().startsWith(value.toLowerCase()));
  _exports.StartsWith = StartsWith;
  const Contains = (value, items, propName) => items.filter(item => item[propName].toLowerCase().includes(value.toLowerCase()));
  _exports.Contains = Contains;
  const None = (_, items) => items;
  _exports.None = None;
});