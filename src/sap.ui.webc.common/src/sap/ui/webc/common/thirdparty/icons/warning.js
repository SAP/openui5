sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/warning", "./v5/warning"], function (_exports, _Theme, _warning, _warning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _warning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _warning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _warning.pathData : _warning2.pathData;
  _exports.pathData = pathData;
  var _default = "warning";
  _exports.default = _default;
});