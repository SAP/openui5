sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/requirement-containment-relationship", "./v3/requirement-containment-relationship"], function (_exports, _Theme, _requirementContainmentRelationship, _requirementContainmentRelationship2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _requirementContainmentRelationship.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _requirementContainmentRelationship.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _requirementContainmentRelationship.pathData : _requirementContainmentRelationship2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/requirement-containment-relationship";
  _exports.default = _default;
});