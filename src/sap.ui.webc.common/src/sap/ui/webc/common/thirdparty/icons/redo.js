sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/redo", "./v5/redo"], function (_exports, _Theme, _redo, _redo2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _redo.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _redo.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _redo.pathData : _redo2.pathData;
  _exports.pathData = pathData;
  var _default = "redo";
  _exports.default = _default;
});