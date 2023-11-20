sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/ad-hoc-marker", "./v3/ad-hoc-marker"], function (_exports, _Theme, _adHocMarker, _adHocMarker2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _adHocMarker.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _adHocMarker.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _adHocMarker.pathData : _adHocMarker2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/ad-hoc-marker";
  _exports.default = _default;
});