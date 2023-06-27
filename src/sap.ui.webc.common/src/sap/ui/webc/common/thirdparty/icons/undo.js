sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/undo", "./v5/undo"], function (_exports, _Theme, _undo, _undo2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _undo.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _undo.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _undo.pathData : _undo2.pathData;
  _exports.pathData = pathData;
  var _default = "undo";
  _exports.default = _default;
});