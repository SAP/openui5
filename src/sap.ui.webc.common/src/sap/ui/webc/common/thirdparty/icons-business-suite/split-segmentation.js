sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/split-segmentation", "./v2/split-segmentation"], function (_exports, _Theme, _splitSegmentation, _splitSegmentation2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _splitSegmentation.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _splitSegmentation.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _splitSegmentation.pathData : _splitSegmentation2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/split-segmentation";
  _exports.default = _default;
});