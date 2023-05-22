sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/project-definition-triangle-2", "./v5/project-definition-triangle-2"], function (_exports, _Theme, _projectDefinitionTriangle, _projectDefinitionTriangle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _projectDefinitionTriangle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _projectDefinitionTriangle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _projectDefinitionTriangle.pathData : _projectDefinitionTriangle2.pathData;
  _exports.pathData = pathData;
  var _default = "project-definition-triangle-2";
  _exports.default = _default;
});