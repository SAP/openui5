sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/legal-section", "./v2/legal-section"], function (_exports, _Theme, _legalSection, _legalSection2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _legalSection.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _legalSection.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _legalSection.pathData : _legalSection2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/legal-section";
  _exports.default = _default;
});