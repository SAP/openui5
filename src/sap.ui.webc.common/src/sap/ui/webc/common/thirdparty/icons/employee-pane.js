sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/employee-pane", "./v5/employee-pane"], function (_exports, _Theme, _employeePane, _employeePane2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _employeePane.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _employeePane.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _employeePane.pathData : _employeePane2.pathData;
  _exports.pathData = pathData;
  var _default = "employee-pane";
  _exports.default = _default;
});