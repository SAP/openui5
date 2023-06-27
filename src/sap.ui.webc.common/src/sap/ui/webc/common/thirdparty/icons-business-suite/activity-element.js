sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/activity-element", "./v2/activity-element"], function (_exports, _Theme, _activityElement, _activityElement2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activityElement.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activityElement.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activityElement.pathData : _activityElement2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/activity-element";
  _exports.default = _default;
});