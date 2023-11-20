sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/activity-assigned-to-goal", "./v5/activity-assigned-to-goal"], function (_exports, _Theme, _activityAssignedToGoal, _activityAssignedToGoal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activityAssignedToGoal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activityAssignedToGoal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activityAssignedToGoal.pathData : _activityAssignedToGoal2.pathData;
  _exports.pathData = pathData;
  var _default = "activity-assigned-to-goal";
  _exports.default = _default;
});