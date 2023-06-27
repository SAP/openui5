sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/activity-2", "./v5/activity-2"], function (_exports, _Theme, _activity, _activity2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activity.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activity.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activity.pathData : _activity2.pathData;
  _exports.pathData = pathData;
  var _default = "activity-2";
  _exports.default = _default;
});