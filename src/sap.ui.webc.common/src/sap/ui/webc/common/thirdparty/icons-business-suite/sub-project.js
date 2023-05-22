sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/sub-project", "./v2/sub-project"], function (_exports, _Theme, _subProject, _subProject2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _subProject.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _subProject.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _subProject.pathData : _subProject2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/sub-project";
  _exports.default = _default;
});