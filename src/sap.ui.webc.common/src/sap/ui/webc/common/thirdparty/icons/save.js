sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/save", "./v5/save"], function (_exports, _Theme, _save, _save2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _save.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _save.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _save.pathData : _save2.pathData;
  _exports.pathData = pathData;
  var _default = "save";
  _exports.default = _default;
});