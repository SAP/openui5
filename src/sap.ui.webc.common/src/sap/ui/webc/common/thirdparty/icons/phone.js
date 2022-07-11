sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/phone", "./v4/phone"], function (_exports, _Theme, _phone, _phone2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _phone.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _phone.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _phone.pathData : _phone2.pathData;
  _exports.pathData = pathData;
  var _default = "phone";
  _exports.default = _default;
});