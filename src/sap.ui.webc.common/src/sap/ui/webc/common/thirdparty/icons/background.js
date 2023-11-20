sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/background", "./v5/background"], function (_exports, _Theme, _background, _background2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _background.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _background.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _background.pathData : _background2.pathData;
  _exports.pathData = pathData;
  var _default = "background";
  _exports.default = _default;
});