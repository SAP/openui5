sap.ui.define(["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.kebabToCamelCase = _exports.camelToKebabCase = void 0;
  const kebabToCamelMap = new Map();
  const camelToKebabMap = new Map();
  const kebabToCamelCase = string => {
    if (!kebabToCamelMap.has(string)) {
      const result = toCamelCase(string.split("-"));
      kebabToCamelMap.set(string, result);
    }
    return kebabToCamelMap.get(string);
  };
  _exports.kebabToCamelCase = kebabToCamelCase;
  const camelToKebabCase = string => {
    if (!camelToKebabMap.has(string)) {
      const result = string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
      camelToKebabMap.set(string, result);
    }
    return camelToKebabMap.get(string);
  };
  _exports.camelToKebabCase = camelToKebabCase;
  const toCamelCase = parts => {
    return parts.map((string, index) => {
      return index === 0 ? string.toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }).join("");
  };
});