sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/production", "./v2/production"], function (_exports, _Theme, _production, _production2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _production.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _production.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _production.pathData : _production2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/production";
  _exports.default = _default;
});