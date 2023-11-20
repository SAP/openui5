sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/ship", "./v2/ship"], function (_exports, _Theme, _ship, _ship2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _ship.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _ship.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _ship.pathData : _ship2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/ship";
  _exports.default = _default;
});