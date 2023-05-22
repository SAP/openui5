sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/burglary", "./v5/burglary"], function (_exports, _Theme, _burglary, _burglary2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _burglary.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _burglary.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _burglary.pathData : _burglary2.pathData;
  _exports.pathData = pathData;
  var _default = "burglary";
  _exports.default = _default;
});