sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/data-access", "./v2/data-access"], function (_exports, _Theme, _dataAccess, _dataAccess2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dataAccess.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dataAccess.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dataAccess.pathData : _dataAccess2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/data-access";
  _exports.default = _default;
});