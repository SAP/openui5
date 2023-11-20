sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/travel-request", "./v5/travel-request"], function (_exports, _Theme, _travelRequest, _travelRequest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _travelRequest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _travelRequest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _travelRequest.pathData : _travelRequest2.pathData;
  _exports.pathData = pathData;
  var _default = "travel-request";
  _exports.default = _default;
});