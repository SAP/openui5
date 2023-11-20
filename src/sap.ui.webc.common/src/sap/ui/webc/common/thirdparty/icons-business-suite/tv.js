sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/tv", "./v2/tv"], function (_exports, _Theme, _tv, _tv2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _tv.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _tv.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _tv.pathData : _tv2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/tv";
  _exports.default = _default;
});