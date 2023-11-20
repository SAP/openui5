sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/transformer", "./v2/transformer"], function (_exports, _Theme, _transformer, _transformer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _transformer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _transformer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _transformer.pathData : _transformer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/transformer";
  _exports.default = _default;
});