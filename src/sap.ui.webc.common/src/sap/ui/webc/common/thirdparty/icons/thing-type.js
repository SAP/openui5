sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/thing-type", "./v5/thing-type"], function (_exports, _Theme, _thingType, _thingType2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thingType.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thingType.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thingType.pathData : _thingType2.pathData;
  _exports.pathData = pathData;
  var _default = "thing-type";
  _exports.default = _default;
});