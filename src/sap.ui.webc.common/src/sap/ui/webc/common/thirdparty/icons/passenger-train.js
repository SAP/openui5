sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/passenger-train", "./v5/passenger-train"], function (_exports, _Theme, _passengerTrain, _passengerTrain2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _passengerTrain.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _passengerTrain.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _passengerTrain.pathData : _passengerTrain2.pathData;
  _exports.pathData = pathData;
  var _default = "passenger-train";
  _exports.default = _default;
});