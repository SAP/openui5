sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/generation", "./v2/generation"], function (_exports, _Theme, _generation, _generation2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _generation.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _generation.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _generation.pathData : _generation2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/generation";
  _exports.default = _default;
});