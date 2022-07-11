sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/alphabetical-order", "./v4/alphabetical-order"], function (_exports, _Theme, _alphabeticalOrder, _alphabeticalOrder2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _alphabeticalOrder.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _alphabeticalOrder.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _alphabeticalOrder.pathData : _alphabeticalOrder2.pathData;
  _exports.pathData = pathData;
  var _default = "alphabetical-order";
  _exports.default = _default;
});