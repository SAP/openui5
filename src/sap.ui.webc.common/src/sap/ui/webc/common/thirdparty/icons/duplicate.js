sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/duplicate", "./v5/duplicate"], function (_exports, _Theme, _duplicate, _duplicate2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _duplicate.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _duplicate.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _duplicate.pathData : _duplicate2.pathData;
  _exports.pathData = pathData;
  var _default = "duplicate";
  _exports.default = _default;
});