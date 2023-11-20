sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/layer", "./v2/layer"], function (_exports, _Theme, _layer, _layer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _layer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _layer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _layer.pathData : _layer2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/layer";
  _exports.default = _default;
});