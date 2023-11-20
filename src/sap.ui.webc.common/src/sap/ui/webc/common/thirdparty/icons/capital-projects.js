sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/capital-projects", "./v5/capital-projects"], function (_exports, _Theme, _capitalProjects, _capitalProjects2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _capitalProjects.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _capitalProjects.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _capitalProjects.pathData : _capitalProjects2.pathData;
  _exports.pathData = pathData;
  var _default = "capital-projects";
  _exports.default = _default;
});