sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/enter-more", "./v5/enter-more"], function (_exports, _Theme, _enterMore, _enterMore2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _enterMore.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _enterMore.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _enterMore.pathData : _enterMore2.pathData;
  _exports.pathData = pathData;
  var _default = "enter-more";
  _exports.default = _default;
});