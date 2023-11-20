sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/competitor", "./v5/competitor"], function (_exports, _Theme, _competitor, _competitor2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _competitor.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _competitor.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _competitor.pathData : _competitor2.pathData;
  _exports.pathData = pathData;
  var _default = "competitor";
  _exports.default = _default;
});