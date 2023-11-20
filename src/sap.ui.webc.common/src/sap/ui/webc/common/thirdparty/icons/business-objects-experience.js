sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/business-objects-experience", "./v5/business-objects-experience"], function (_exports, _Theme, _businessObjectsExperience, _businessObjectsExperience2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _businessObjectsExperience.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _businessObjectsExperience.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _businessObjectsExperience.pathData : _businessObjectsExperience2.pathData;
  _exports.pathData = pathData;
  var _default = "business-objects-experience";
  _exports.default = _default;
});