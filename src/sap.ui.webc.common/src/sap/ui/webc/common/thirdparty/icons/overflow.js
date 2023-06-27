sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/overflow", "./v5/overflow"], function (_exports, _Theme, _overflow, _overflow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _overflow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _overflow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _overflow.pathData : _overflow2.pathData;
  _exports.pathData = pathData;
  var _default = "overflow";
  _exports.default = _default;
});