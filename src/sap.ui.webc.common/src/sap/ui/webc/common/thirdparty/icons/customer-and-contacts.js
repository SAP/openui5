sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/customer-and-contacts", "./v5/customer-and-contacts"], function (_exports, _Theme, _customerAndContacts, _customerAndContacts2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _customerAndContacts.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _customerAndContacts.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _customerAndContacts.pathData : _customerAndContacts2.pathData;
  _exports.pathData = pathData;
  var _default = "customer-and-contacts";
  _exports.default = _default;
});