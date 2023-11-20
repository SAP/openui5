sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/next-open-item", "./v2/next-open-item"], function (_exports, _Theme, _nextOpenItem, _nextOpenItem2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _nextOpenItem.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _nextOpenItem.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _nextOpenItem.pathData : _nextOpenItem2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/next-open-item";
  _exports.default = _default;
});