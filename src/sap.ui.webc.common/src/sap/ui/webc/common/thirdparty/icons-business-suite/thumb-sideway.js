sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/thumb-sideway", "./v2/thumb-sideway"], function (_exports, _Theme, _thumbSideway, _thumbSideway2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _thumbSideway.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _thumbSideway.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _thumbSideway.pathData : _thumbSideway2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/thumb-sideway";
  _exports.default = _default;
});