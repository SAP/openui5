sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/company-view", "./v5/company-view"], function (_exports, _Theme, _companyView, _companyView2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _companyView.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _companyView.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _companyView.pathData : _companyView2.pathData;
  _exports.pathData = pathData;
  var _default = "company-view";
  _exports.default = _default;
});