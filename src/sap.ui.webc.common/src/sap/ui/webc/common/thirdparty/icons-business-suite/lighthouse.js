sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/lighthouse", "./v2/lighthouse"], function (_exports, _Theme, _lighthouse, _lighthouse2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _lighthouse.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _lighthouse.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _lighthouse.pathData : _lighthouse2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/lighthouse";
  _exports.default = _default;
});