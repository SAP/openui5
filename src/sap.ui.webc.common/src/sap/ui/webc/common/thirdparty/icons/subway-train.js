sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/subway-train", "./v5/subway-train"], function (_exports, _Theme, _subwayTrain, _subwayTrain2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _subwayTrain.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _subwayTrain.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _subwayTrain.pathData : _subwayTrain2.pathData;
  _exports.pathData = pathData;
  var _default = "subway-train";
  _exports.default = _default;
});