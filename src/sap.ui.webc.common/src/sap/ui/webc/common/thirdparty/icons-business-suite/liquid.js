sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/liquid", "./v2/liquid"], function (_exports, _Theme, _liquid, _liquid2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _liquid.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _liquid.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _liquid.pathData : _liquid2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/liquid";
  _exports.default = _default;
});