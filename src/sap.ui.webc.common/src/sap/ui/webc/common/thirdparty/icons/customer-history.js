sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer-history", "./v5/customer-history"], function (_exports, _Theme, _customerHistory, _customerHistory2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customerHistory.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customerHistory.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customerHistory.pathData : _customerHistory2.pathData;
  _exports.pathData = pathData;
  var _default = "customer-history";
  _exports.default = _default;
});