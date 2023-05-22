sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/blood-test", "./v2/blood-test"], function (_exports, _Theme, _bloodTest, _bloodTest2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bloodTest.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bloodTest.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bloodTest.pathData : _bloodTest2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/blood-test";
  _exports.default = _default;
});