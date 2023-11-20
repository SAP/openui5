sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/strike-through", "./v2/strike-through"], function (_exports, _Theme, _strikeThrough, _strikeThrough2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _strikeThrough.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _strikeThrough.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _strikeThrough.pathData : _strikeThrough2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/strike-through";
  _exports.default = _default;
});