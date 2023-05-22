sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cloud", "./v5/cloud"], function (_exports, _Theme, _cloud, _cloud2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cloud.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cloud.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cloud.pathData : _cloud2.pathData;
  _exports.pathData = pathData;
  var _default = "cloud";
  _exports.default = _default;
});