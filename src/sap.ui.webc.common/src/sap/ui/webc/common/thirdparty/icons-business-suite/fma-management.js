sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/fma-management", "./v2/fma-management"], function (_exports, _Theme, _fmaManagement, _fmaManagement2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fmaManagement.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fmaManagement.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fmaManagement.pathData : _fmaManagement2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/fma-management";
  _exports.default = _default;
});