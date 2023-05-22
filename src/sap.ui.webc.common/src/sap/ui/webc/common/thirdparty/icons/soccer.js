sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/soccer", "./v5/soccer"], function (_exports, _Theme, _soccer, _soccer2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _soccer.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _soccer.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _soccer.pathData : _soccer2.pathData;
  _exports.pathData = pathData;
  var _default = "soccer";
  _exports.default = _default;
});