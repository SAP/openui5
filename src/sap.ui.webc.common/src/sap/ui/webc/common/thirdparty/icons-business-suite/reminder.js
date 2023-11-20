sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/reminder", "./v2/reminder"], function (_exports, _Theme, _reminder, _reminder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _reminder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _reminder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _reminder.pathData : _reminder2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/reminder";
  _exports.default = _default;
});