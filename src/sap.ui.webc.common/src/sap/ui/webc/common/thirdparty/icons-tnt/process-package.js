sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/process-package", "./v3/process-package"], function (_exports, _Theme, _processPackage, _processPackage2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _processPackage.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _processPackage.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _processPackage.pathData : _processPackage2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/process-package";
  _exports.default = _default;
});