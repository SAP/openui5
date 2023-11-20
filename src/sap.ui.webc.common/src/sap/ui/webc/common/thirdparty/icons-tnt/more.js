sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/more", "./v3/more"], function (_exports, _Theme, _more, _more2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _more.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _more.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _more.pathData : _more2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/more";
  _exports.default = _default;
});