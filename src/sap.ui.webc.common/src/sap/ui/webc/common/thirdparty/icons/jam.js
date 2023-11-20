sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/jam", "./v5/jam"], function (_exports, _Theme, _jam, _jam2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _jam.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _jam.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _jam.pathData : _jam2.pathData;
  _exports.pathData = pathData;
  var _default = "jam";
  _exports.default = _default;
});