sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/technicalscenario", "./v3/technicalscenario"], function (_exports, _Theme, _technicalscenario, _technicalscenario2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _technicalscenario.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _technicalscenario.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _technicalscenario.pathData : _technicalscenario2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/technicalscenario";
  _exports.default = _default;
});