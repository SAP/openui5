sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/ab-testing", "./v2/ab-testing"], function (_exports, _Theme, _abTesting, _abTesting2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _abTesting.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _abTesting.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _abTesting.pathData : _abTesting2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/ab-testing";
  _exports.default = _default;
});