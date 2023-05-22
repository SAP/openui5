sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer-view", "./v5/customer-view"], function (_exports, _Theme, _customerView, _customerView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customerView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customerView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customerView.pathData : _customerView2.pathData;
  _exports.pathData = pathData;
  var _default = "customer-view";
  _exports.default = _default;
});