sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/cargo-train", "./v5/cargo-train"], function (_exports, _Theme, _cargoTrain, _cargoTrain2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _cargoTrain.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _cargoTrain.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _cargoTrain.pathData : _cargoTrain2.pathData;
  _exports.pathData = pathData;
  var _default = "cargo-train";
  _exports.default = _default;
});