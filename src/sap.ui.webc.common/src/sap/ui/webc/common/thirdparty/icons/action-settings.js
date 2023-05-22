sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/action-settings", "./v5/action-settings"], function (_exports, _Theme, _actionSettings, _actionSettings2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _actionSettings.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _actionSettings.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _actionSettings.pathData : _actionSettings2.pathData;
  _exports.pathData = pathData;
  var _default = "action-settings";
  _exports.default = _default;
});