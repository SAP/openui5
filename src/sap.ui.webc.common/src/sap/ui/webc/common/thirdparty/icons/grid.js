sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/grid", "./v5/grid"], function (_exports, _Theme, _grid, _grid2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _grid.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _grid.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _grid.pathData : _grid2.pathData;
  _exports.pathData = pathData;
  var _default = "grid";
  _exports.default = _default;
});