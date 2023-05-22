sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/theater", "./v5/theater"], function (_exports, _Theme, _theater, _theater2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _theater.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _theater.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _theater.pathData : _theater2.pathData;
  _exports.pathData = pathData;
  var _default = "theater";
  _exports.default = _default;
});