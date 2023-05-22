sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/expand-all", "./v2/expand-all"], function (_exports, _Theme, _expandAll, _expandAll2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expandAll.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expandAll.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expandAll.pathData : _expandAll2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/expand-all";
  _exports.default = _default;
});