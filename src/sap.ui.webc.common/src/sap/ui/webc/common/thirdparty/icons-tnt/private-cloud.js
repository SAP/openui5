sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/private-cloud", "./v3/private-cloud"], function (_exports, _Theme, _privateCloud, _privateCloud2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _privateCloud.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _privateCloud.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _privateCloud.pathData : _privateCloud2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/private-cloud";
  _exports.default = _default;
});