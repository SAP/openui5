sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/copy", "./v5/copy"], function (_exports, _Theme, _copy, _copy2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _copy.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _copy.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _copy.pathData : _copy2.pathData;
  _exports.pathData = pathData;
  var _default = "copy";
  _exports.default = _default;
});