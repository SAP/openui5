sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/provided-interface", "./v3/provided-interface"], function (_exports, _Theme, _providedInterface, _providedInterface2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _providedInterface.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _providedInterface.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _providedInterface.pathData : _providedInterface2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/provided-interface";
  _exports.default = _default;
});