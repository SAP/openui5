sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/github", "./v3/github"], function (_exports, _Theme, _github, _github2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _github.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _github.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _github.pathData : _github2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/github";
  _exports.default = _default;
});