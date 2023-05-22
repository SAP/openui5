sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/explorer", "./v5/explorer"], function (_exports, _Theme, _explorer, _explorer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _explorer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _explorer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _explorer.pathData : _explorer2.pathData;
  _exports.pathData = pathData;
  var _default = "explorer";
  _exports.default = _default;
});