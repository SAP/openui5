sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/cell-lock", "./v2/cell-lock"], function (_exports, _Theme, _cellLock, _cellLock2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cellLock.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cellLock.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cellLock.pathData : _cellLock2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/cell-lock";
  _exports.default = _default;
});