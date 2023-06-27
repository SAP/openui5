sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/fob-watch", "./v5/fob-watch"], function (_exports, _Theme, _fobWatch, _fobWatch2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _fobWatch.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _fobWatch.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _fobWatch.pathData : _fobWatch2.pathData;
  _exports.pathData = pathData;
  var _default = "fob-watch";
  _exports.default = _default;
});