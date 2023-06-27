sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/collapse-all", "./v5/collapse-all"], function (_exports, _Theme, _collapseAll, _collapseAll2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _collapseAll.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _collapseAll.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _collapseAll.pathData : _collapseAll2.pathData;
  _exports.pathData = pathData;
  var _default = "collapse-all";
  _exports.default = _default;
});