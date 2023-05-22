sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/change-time-horizon", "./v2/change-time-horizon"], function (_exports, _Theme, _changeTimeHorizon, _changeTimeHorizon2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _changeTimeHorizon.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _changeTimeHorizon.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _changeTimeHorizon.pathData : _changeTimeHorizon2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/change-time-horizon";
  _exports.default = _default;
});