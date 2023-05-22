sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/create", "./v5/create"], function (_exports, _Theme, _create, _create2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _create.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _create.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _create.pathData : _create2.pathData;
  _exports.pathData = pathData;
  var _default = "create";
  _exports.default = _default;
});