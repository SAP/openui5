sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/expand", "./v5/expand"], function (_exports, _Theme, _expand, _expand2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _expand.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _expand.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _expand.pathData : _expand2.pathData;
  _exports.pathData = pathData;
  var _default = "expand";
  _exports.default = _default;
});