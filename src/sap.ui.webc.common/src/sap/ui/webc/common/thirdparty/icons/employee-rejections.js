sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/employee-rejections", "./v5/employee-rejections"], function (_exports, _Theme, _employeeRejections, _employeeRejections2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _employeeRejections.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _employeeRejections.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _employeeRejections.pathData : _employeeRejections2.pathData;
  _exports.pathData = pathData;
  var _default = "employee-rejections";
  _exports.default = _default;
});