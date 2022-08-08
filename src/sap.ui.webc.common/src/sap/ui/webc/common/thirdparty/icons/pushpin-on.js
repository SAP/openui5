sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/pushpin-on", "./v4/pushpin-on"], function (_exports, _Theme, _pushpinOn, _pushpinOn2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pushpinOn.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pushpinOn.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _pushpinOn.pathData : _pushpinOn2.pathData;
  _exports.pathData = pathData;
  var _default = "pushpin-on";
  _exports.default = _default;
});