sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/display-ads", "./v2/display-ads"], function (_exports, _Theme, _displayAds, _displayAds2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _displayAds.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _displayAds.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _displayAds.pathData : _displayAds2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/display-ads";
  _exports.default = _default;
});