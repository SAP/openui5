sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/time-deposit", "./v2/time-deposit"], function (_exports, _Theme, _timeDeposit, _timeDeposit2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _timeDeposit.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _timeDeposit.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _timeDeposit.pathData : _timeDeposit2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/time-deposit";
  _exports.default = _default;
});