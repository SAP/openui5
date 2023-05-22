sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/combine", "./v5/combine"], function (_exports, _Theme, _combine, _combine2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _combine.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _combine.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _combine.pathData : _combine2.pathData;
  _exports.pathData = pathData;
  var _default = "combine";
  _exports.default = _default;
});