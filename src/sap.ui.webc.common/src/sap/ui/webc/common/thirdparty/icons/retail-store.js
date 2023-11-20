sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/retail-store", "./v5/retail-store"], function (_exports, _Theme, _retailStore, _retailStore2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _retailStore.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _retailStore.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _retailStore.pathData : _retailStore2.pathData;
  _exports.pathData = pathData;
  var _default = "retail-store";
  _exports.default = _default;
});