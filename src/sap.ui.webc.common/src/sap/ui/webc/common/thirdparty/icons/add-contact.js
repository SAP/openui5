sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/add-contact", "./v5/add-contact"], function (_exports, _Theme, _addContact, _addContact2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _addContact.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _addContact.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _addContact.pathData : _addContact2.pathData;
  _exports.pathData = pathData;
  var _default = "add-contact";
  _exports.default = _default;
});