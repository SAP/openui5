sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/association", "./v3/association"], function (_exports, _Theme, _association, _association2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _association.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _association.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _association.pathData : _association2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/association";
  _exports.default = _default;
});