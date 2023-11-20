sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/functional-location", "./v5/functional-location"], function (_exports, _Theme, _functionalLocation, _functionalLocation2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _functionalLocation.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _functionalLocation.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _functionalLocation.pathData : _functionalLocation2.pathData;
  _exports.pathData = pathData;
  var _default = "functional-location";
  _exports.default = _default;
});