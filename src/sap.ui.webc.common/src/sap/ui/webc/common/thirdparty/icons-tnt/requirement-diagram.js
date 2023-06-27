sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/requirement-diagram", "./v3/requirement-diagram"], function (_exports, _Theme, _requirementDiagram, _requirementDiagram2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _requirementDiagram.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _requirementDiagram.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _requirementDiagram.pathData : _requirementDiagram2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/requirement-diagram";
  _exports.default = _default;
});