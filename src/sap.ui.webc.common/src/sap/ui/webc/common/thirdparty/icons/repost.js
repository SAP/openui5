sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/repost", "./v5/repost"], function (_exports, _Theme, _repost, _repost2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _repost.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _repost.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _repost.pathData : _repost2.pathData;
  _exports.pathData = pathData;
  var _default = "repost";
  _exports.default = _default;
});