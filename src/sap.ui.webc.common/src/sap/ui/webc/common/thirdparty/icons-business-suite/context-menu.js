sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/context-menu", "./v2/context-menu"], function (_exports, _Theme, _contextMenu, _contextMenu2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _contextMenu.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _contextMenu.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _contextMenu.pathData : _contextMenu2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/context-menu";
  _exports.default = _default;
});