sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/inspect", "./v5/inspect"], function (_exports, _Theme, _inspect, _inspect2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _inspect.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _inspect.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _inspect.pathData : _inspect2.pathData;
  _exports.pathData = pathData;
  var _default = "inspect";
  _exports.default = _default;
});