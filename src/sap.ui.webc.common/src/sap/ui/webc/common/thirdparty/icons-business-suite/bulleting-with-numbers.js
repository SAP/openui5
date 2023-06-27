sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/bulleting-with-numbers", "./v2/bulleting-with-numbers"], function (_exports, _Theme, _bulletingWithNumbers, _bulletingWithNumbers2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _bulletingWithNumbers.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _bulletingWithNumbers.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _bulletingWithNumbers.pathData : _bulletingWithNumbers2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/bulleting-with-numbers";
  _exports.default = _default;
});