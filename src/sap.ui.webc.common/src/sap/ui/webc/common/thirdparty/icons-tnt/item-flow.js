sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/item-flow", "./v3/item-flow"], function (_exports, _Theme, _itemFlow, _itemFlow2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _itemFlow.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _itemFlow.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _itemFlow.pathData : _itemFlow2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/item-flow";
  _exports.default = _default;
});