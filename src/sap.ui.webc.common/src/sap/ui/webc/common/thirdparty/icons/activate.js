sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/activate", "./v5/activate"], function (_exports, _Theme, _activate, _activate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _activate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _activate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _activate.pathData : _activate2.pathData;
  _exports.pathData = pathData;
  var _default = "activate";
  _exports.default = _default;
});