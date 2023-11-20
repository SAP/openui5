sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/main-milestone", "./v2/main-milestone"], function (_exports, _Theme, _mainMilestone, _mainMilestone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _mainMilestone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _mainMilestone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _mainMilestone.pathData : _mainMilestone2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/main-milestone";
  _exports.default = _default;
});