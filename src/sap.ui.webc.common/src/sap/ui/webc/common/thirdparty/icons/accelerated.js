sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/accelerated", "./v5/accelerated"], function (_exports, _Theme, _accelerated, _accelerated2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _accelerated.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _accelerated.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _accelerated.pathData : _accelerated2.pathData;
  _exports.pathData = pathData;
  var _default = "accelerated";
  _exports.default = _default;
});