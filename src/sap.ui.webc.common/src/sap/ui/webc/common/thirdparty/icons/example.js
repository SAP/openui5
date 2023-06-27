sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/example", "./v5/example"], function (_exports, _Theme, _example, _example2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _example.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _example.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _example.pathData : _example2.pathData;
  _exports.pathData = pathData;
  var _default = "example";
  _exports.default = _default;
});