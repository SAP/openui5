sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/flight", "./v5/flight"], function (_exports, _Theme, _flight, _flight2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _flight.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _flight.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _flight.pathData : _flight2.pathData;
  _exports.pathData = pathData;
  var _default = "flight";
  _exports.default = _default;
});