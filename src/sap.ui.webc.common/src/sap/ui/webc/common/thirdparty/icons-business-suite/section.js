sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/section", "./v2/section"], function (_exports, _Theme, _section, _section2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _section.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _section.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _section.pathData : _section2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/section";
  _exports.default = _default;
});