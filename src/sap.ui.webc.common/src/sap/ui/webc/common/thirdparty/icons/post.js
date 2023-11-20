sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/post", "./v5/post"], function (_exports, _Theme, _post, _post2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _post.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _post.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _post.pathData : _post2.pathData;
  _exports.pathData = pathData;
  var _default = "post";
  _exports.default = _default;
});