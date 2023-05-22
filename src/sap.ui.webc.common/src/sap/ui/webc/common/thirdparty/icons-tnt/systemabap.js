sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/systemabap", "./v3/systemabap"], function (_exports, _Theme, _systemabap, _systemabap2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _systemabap.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _systemabap.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _systemabap.pathData : _systemabap2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/systemabap";
  _exports.default = _default;
});