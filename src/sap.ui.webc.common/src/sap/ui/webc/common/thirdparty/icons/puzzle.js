sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/puzzle", "./v5/puzzle"], function (_exports, _Theme, _puzzle, _puzzle2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _puzzle.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _puzzle.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _puzzle.pathData : _puzzle2.pathData;
  _exports.pathData = pathData;
  var _default = "puzzle";
  _exports.default = _default;
});