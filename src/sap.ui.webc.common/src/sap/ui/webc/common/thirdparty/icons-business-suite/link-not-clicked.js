sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/link-not-clicked", "./v2/link-not-clicked"], function (_exports, _Theme, _linkNotClicked, _linkNotClicked2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _linkNotClicked.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _linkNotClicked.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _linkNotClicked.pathData : _linkNotClicked2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/link-not-clicked";
  _exports.default = _default;
});