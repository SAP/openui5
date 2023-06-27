sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/activity-items", "./v5/activity-items"], function (_exports, _Theme, _activityItems, _activityItems2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activityItems.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activityItems.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activityItems.pathData : _activityItems2.pathData;
  _exports.pathData = pathData;
  var _default = "activity-items";
  _exports.default = _default;
});