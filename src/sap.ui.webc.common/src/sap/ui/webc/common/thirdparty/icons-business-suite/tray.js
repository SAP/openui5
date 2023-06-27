sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/tray", "./v2/tray"], function (_exports, _Theme, _tray, _tray2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tray.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tray.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tray.pathData : _tray2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/tray";
  _exports.default = _default;
});