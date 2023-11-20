sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/chalkboard", "./v5/chalkboard"], function (_exports, _Theme, _chalkboard, _chalkboard2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _chalkboard.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _chalkboard.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _chalkboard.pathData : _chalkboard2.pathData;
  _exports.pathData = pathData;
  var _default = "chalkboard";
  _exports.default = _default;
});