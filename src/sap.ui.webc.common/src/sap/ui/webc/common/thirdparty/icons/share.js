sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/share", "./v5/share"], function (_exports, _Theme, _share, _share2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _share.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _share.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _share.pathData : _share2.pathData;
  _exports.pathData = pathData;
  var _default = "share";
  _exports.default = _default;
});