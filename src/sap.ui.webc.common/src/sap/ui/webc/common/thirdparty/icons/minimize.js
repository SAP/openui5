sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/minimize", "./v5/minimize"], function (_exports, _Theme, _minimize, _minimize2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _minimize.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _minimize.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _minimize.pathData : _minimize2.pathData;
  _exports.pathData = pathData;
  var _default = "minimize";
  _exports.default = _default;
});