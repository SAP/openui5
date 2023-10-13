sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/time-off", "./v5/time-off"], function (_exports, _Theme, _timeOff, _timeOff2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _timeOff.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _timeOff.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _timeOff.pathData : _timeOff2.pathData;
  _exports.pathData = pathData;
  var _default = "time-off";
  _exports.default = _default;
});