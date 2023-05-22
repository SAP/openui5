sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/value-flow", "./v3/value-flow"], function (_exports, _Theme, _valueFlow, _valueFlow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _valueFlow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _valueFlow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _valueFlow.pathData : _valueFlow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/value-flow";
  _exports.default = _default;
});