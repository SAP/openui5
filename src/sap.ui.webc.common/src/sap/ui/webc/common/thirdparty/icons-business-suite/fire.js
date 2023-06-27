sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/fire", "./v2/fire"], function (_exports, _Theme, _fire, _fire2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fire.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fire.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fire.pathData : _fire2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/fire";
  _exports.default = _default;
});