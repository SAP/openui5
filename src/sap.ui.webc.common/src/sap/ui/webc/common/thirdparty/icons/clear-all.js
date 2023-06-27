sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/clear-all", "./v5/clear-all"], function (_exports, _Theme, _clearAll, _clearAll2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _clearAll.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _clearAll.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _clearAll.pathData : _clearAll2.pathData;
  _exports.pathData = pathData;
  var _default = "clear-all";
  _exports.default = _default;
});