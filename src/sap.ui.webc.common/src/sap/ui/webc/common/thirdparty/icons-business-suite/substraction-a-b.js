sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/substraction-a-b", "./v2/substraction-a-b"], function (_exports, _Theme, _substractionAB, _substractionAB2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _substractionAB.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _substractionAB.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _substractionAB.pathData : _substractionAB2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/substraction-a-b";
  _exports.default = _default;
});