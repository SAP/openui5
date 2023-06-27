sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/marital-status", "./v2/marital-status"], function (_exports, _Theme, _maritalStatus, _maritalStatus2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _maritalStatus.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _maritalStatus.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _maritalStatus.pathData : _maritalStatus2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/marital-status";
  _exports.default = _default;
});