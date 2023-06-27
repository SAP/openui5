sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/badge", "./v5/badge"], function (_exports, _Theme, _badge, _badge2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _badge.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _badge.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _badge.pathData : _badge2.pathData;
  _exports.pathData = pathData;
  var _default = "badge";
  _exports.default = _default;
});