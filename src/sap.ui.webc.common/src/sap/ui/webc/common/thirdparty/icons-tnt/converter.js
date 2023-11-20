sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/converter", "./v3/converter"], function (_exports, _Theme, _converter, _converter2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _converter.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _converter.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _converter.pathData : _converter2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/converter";
  _exports.default = _default;
});