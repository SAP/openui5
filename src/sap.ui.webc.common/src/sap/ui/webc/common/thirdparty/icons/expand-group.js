sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/expand-group", "./v5/expand-group"], function (_exports, _Theme, _expandGroup, _expandGroup2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expandGroup.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expandGroup.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expandGroup.pathData : _expandGroup2.pathData;
  _exports.pathData = pathData;
  var _default = "expand-group";
  _exports.default = _default;
});