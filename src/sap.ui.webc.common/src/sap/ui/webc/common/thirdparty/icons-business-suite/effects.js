sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/effects", "./v2/effects"], function (_exports, _Theme, _effects, _effects2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _effects.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _effects.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _effects.pathData : _effects2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/effects";
  _exports.default = _default;
});