sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/data-store", "./v3/data-store"], function (_exports, _Theme, _dataStore, _dataStore2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _dataStore.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _dataStore.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _dataStore.pathData : _dataStore2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/data-store";
  _exports.default = _default;
});