sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/broken-link", "./v5/broken-link"], function (_exports, _Theme, _brokenLink, _brokenLink2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _brokenLink.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _brokenLink.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _brokenLink.pathData : _brokenLink2.pathData;
  _exports.pathData = pathData;
  var _default = "broken-link";
  _exports.default = _default;
});