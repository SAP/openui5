sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/pipette", "./v2/pipette"], function (_exports, _Theme, _pipette, _pipette2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pipette.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pipette.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pipette.pathData : _pipette2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/pipette";
  _exports.default = _default;
});