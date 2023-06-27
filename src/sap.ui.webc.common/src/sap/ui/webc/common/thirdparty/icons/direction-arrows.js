sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/direction-arrows", "./v5/direction-arrows"], function (_exports, _Theme, _directionArrows, _directionArrows2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _directionArrows.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _directionArrows.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _directionArrows.pathData : _directionArrows2.pathData;
  _exports.pathData = pathData;
  var _default = "direction-arrows";
  _exports.default = _default;
});