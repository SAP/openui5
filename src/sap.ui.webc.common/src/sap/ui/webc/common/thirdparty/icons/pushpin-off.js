sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pushpin-off", "./v5/pushpin-off"], function (_exports, _Theme, _pushpinOff, _pushpinOff2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pushpinOff.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pushpinOff.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pushpinOff.pathData : _pushpinOff2.pathData;
  _exports.pathData = pathData;
  var _default = "pushpin-off";
  _exports.default = _default;
});