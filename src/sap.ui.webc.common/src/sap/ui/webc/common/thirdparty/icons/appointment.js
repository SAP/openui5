sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/appointment", "./v5/appointment"], function (_exports, _Theme, _appointment, _appointment2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _appointment.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _appointment.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _appointment.pathData : _appointment2.pathData;
  _exports.pathData = pathData;
  var _default = "appointment";
  _exports.default = _default;
});