sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/antenna", "./v3/antenna"], function (_exports, _Theme, _antenna, _antenna2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _antenna.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _antenna.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _antenna.pathData : _antenna2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/antenna";
  _exports.default = _default;
});