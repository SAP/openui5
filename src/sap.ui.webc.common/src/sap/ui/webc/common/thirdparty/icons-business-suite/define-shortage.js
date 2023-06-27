sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/define-shortage", "./v2/define-shortage"], function (_exports, _Theme, _defineShortage, _defineShortage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _defineShortage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _defineShortage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _defineShortage.pathData : _defineShortage2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/define-shortage";
  _exports.default = _default;
});