sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/curriculum", "./v5/curriculum"], function (_exports, _Theme, _curriculum, _curriculum2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _curriculum.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _curriculum.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _curriculum.pathData : _curriculum2.pathData;
  _exports.pathData = pathData;
  var _default = "curriculum";
  _exports.default = _default;
});