sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/project-definition", "./v2/project-definition"], function (_exports, _Theme, _projectDefinition, _projectDefinition2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _projectDefinition.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _projectDefinition.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _projectDefinition.pathData : _projectDefinition2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/project-definition";
  _exports.default = _default;
});