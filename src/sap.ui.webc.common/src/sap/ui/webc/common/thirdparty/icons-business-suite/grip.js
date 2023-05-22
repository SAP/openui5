sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/grip", "./v2/grip"], function (_exports, _Theme, _grip, _grip2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _grip.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _grip.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _grip.pathData : _grip2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/grip";
  _exports.default = _default;
});