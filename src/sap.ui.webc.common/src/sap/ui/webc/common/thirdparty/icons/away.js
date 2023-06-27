sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/away", "./v5/away"], function (_exports, _Theme, _away, _away2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _away.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _away.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _away.pathData : _away2.pathData;
  _exports.pathData = pathData;
  var _default = "away";
  _exports.default = _default;
});