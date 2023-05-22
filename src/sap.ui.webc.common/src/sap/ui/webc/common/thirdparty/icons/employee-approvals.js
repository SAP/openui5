sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/employee-approvals", "./v5/employee-approvals"], function (_exports, _Theme, _employeeApprovals, _employeeApprovals2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _employeeApprovals.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _employeeApprovals.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _employeeApprovals.pathData : _employeeApprovals2.pathData;
  _exports.pathData = pathData;
  var _default = "employee-approvals";
  _exports.default = _default;
});