sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/forklift", "./v2/forklift"], function (_exports, _Theme, _forklift, _forklift2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _forklift.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _forklift.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _forklift.pathData : _forklift2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/forklift";
  _exports.default = _default;
});