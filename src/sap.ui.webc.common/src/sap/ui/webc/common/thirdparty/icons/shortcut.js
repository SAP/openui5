sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/shortcut", "./v4/shortcut"], function (_exports, _Theme, _shortcut, _shortcut2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _shortcut.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _shortcut.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _shortcut.pathData : _shortcut2.pathData;
  _exports.pathData = pathData;
  var _default = "shortcut";
  _exports.default = _default;
});