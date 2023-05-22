sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/where-used", "./v2/where-used"], function (_exports, _Theme, _whereUsed, _whereUsed2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _whereUsed.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _whereUsed.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _whereUsed.pathData : _whereUsed2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/where-used";
  _exports.default = _default;
});