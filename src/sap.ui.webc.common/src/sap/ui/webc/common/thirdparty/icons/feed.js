sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/feed", "./v5/feed"], function (_exports, _Theme, _feed, _feed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _feed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _feed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _feed.pathData : _feed2.pathData;
  _exports.pathData = pathData;
  var _default = "feed";
  _exports.default = _default;
});