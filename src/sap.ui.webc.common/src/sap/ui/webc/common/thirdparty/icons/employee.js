sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/employee", "./v4/employee"], function (_exports, _Theme, _employee, _employee2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _employee.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _employee.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _employee.pathData : _employee2.pathData;
  _exports.pathData = pathData;
  var _default = "employee";
  _exports.default = _default;
});