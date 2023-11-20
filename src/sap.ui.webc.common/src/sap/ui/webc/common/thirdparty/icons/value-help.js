sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/value-help", "./v5/value-help"], function (_exports, _Theme, _valueHelp, _valueHelp2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _valueHelp.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _valueHelp.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _valueHelp.pathData : _valueHelp2.pathData;
  _exports.pathData = pathData;
  var _default = "value-help";
  _exports.default = _default;
});