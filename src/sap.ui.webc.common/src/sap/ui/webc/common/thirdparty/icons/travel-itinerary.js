sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/travel-itinerary", "./v5/travel-itinerary"], function (_exports, _Theme, _travelItinerary, _travelItinerary2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _travelItinerary.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _travelItinerary.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _travelItinerary.pathData : _travelItinerary2.pathData;
  _exports.pathData = pathData;
  var _default = "travel-itinerary";
  _exports.default = _default;
});