sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/laptop", "./v5/laptop"], function (_exports, _Theme, _laptop, _laptop2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _laptop.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _laptop.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _laptop.pathData : _laptop2.pathData;
  _exports.pathData = pathData;
  var _default = "laptop";
  _exports.default = _default;
});