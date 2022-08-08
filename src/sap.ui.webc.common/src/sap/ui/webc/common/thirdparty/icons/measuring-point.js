sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/measuring-point", "./v4/measuring-point"], function (_exports, _Theme, _measuringPoint, _measuringPoint2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _measuringPoint.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _measuringPoint.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _measuringPoint.pathData : _measuringPoint2.pathData;
  _exports.pathData = pathData;
  var _default = "measuring-point";
  _exports.default = _default;
});