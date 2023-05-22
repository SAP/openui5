sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/sales-notification", "./v5/sales-notification"], function (_exports, _Theme, _salesNotification, _salesNotification2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _salesNotification.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _salesNotification.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _salesNotification.pathData : _salesNotification2.pathData;
  _exports.pathData = pathData;
  var _default = "sales-notification";
  _exports.default = _default;
});