sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/select-appointments", "./v5/select-appointments"], function (_exports, _Theme, _selectAppointments, _selectAppointments2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _selectAppointments.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _selectAppointments.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _selectAppointments.pathData : _selectAppointments2.pathData;
  _exports.pathData = pathData;
  var _default = "select-appointments";
  _exports.default = _default;
});