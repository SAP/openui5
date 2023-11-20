sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/software-item", "./v2/software-item"], function (_exports, _Theme, _softwareItem, _softwareItem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _softwareItem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _softwareItem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _softwareItem.pathData : _softwareItem2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/software-item";
  _exports.default = _default;
});