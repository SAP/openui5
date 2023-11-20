sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/signal", "./v3/signal"], function (_exports, _Theme, _signal, _signal2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _signal.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _signal.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _signal.pathData : _signal2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/signal";
  _exports.default = _default;
});