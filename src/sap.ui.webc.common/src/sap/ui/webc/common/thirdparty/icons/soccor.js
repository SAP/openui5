sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/soccor", "./v5/soccor"], function (_exports, _Theme, _soccor, _soccor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _soccor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _soccor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _soccor.pathData : _soccor2.pathData;
  _exports.pathData = pathData;
  var _default = "soccor";
  _exports.default = _default;
});