sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/end-user-experience-monitoring", "./v5/end-user-experience-monitoring"], function (_exports, _Theme, _endUserExperienceMonitoring, _endUserExperienceMonitoring2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _endUserExperienceMonitoring.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _endUserExperienceMonitoring.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _endUserExperienceMonitoring.pathData : _endUserExperienceMonitoring2.pathData;
  _exports.pathData = pathData;
  var _default = "end-user-experience-monitoring";
  _exports.default = _default;
});