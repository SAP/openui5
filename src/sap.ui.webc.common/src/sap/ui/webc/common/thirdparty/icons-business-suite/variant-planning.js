sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/variant-planning", "./v2/variant-planning"], function (_exports, _Theme, _variantPlanning, _variantPlanning2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _variantPlanning.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _variantPlanning.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _variantPlanning.pathData : _variantPlanning2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/variant-planning";
  _exports.default = _default;
});