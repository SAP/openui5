sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/create-dashboard", "./v2/create-dashboard"], function (_exports, _Theme, _createDashboard, _createDashboard2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _createDashboard.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _createDashboard.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _createDashboard.pathData : _createDashboard2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/create-dashboard";
  _exports.default = _default;
});