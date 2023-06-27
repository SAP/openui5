sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/exceptions", "./v3/exceptions"], function (_exports, _Theme, _exceptions, _exceptions2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _exceptions.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _exceptions.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _exceptions.pathData : _exceptions2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/exceptions";
  _exports.default = _default;
});