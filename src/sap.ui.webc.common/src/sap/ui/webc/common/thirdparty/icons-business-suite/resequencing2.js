sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/resequencing2", "./v2/resequencing2"], function (_exports, _Theme, _resequencing, _resequencing2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _resequencing.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _resequencing.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _resequencing.pathData : _resequencing2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/resequencing2";
  _exports.default = _default;
});