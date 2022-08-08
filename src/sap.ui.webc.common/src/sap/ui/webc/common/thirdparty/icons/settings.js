sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/settings", "./v4/settings"], function (_exports, _Theme, _settings, _settings2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _settings.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _settings.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _settings.pathData : _settings2.pathData;
  _exports.pathData = pathData;
  var _default = "settings";
  _exports.default = _default;
});