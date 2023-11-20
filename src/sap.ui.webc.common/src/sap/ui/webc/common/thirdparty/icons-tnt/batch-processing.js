sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v2/batch-processing", "./v3/batch-processing"], function (_exports, _Theme, _batchProcessing, _batchProcessing2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _batchProcessing.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _batchProcessing.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _batchProcessing.pathData : _batchProcessing2.pathData;
  _exports.pathData = pathData;
  var _default = "tnt/batch-processing";
  _exports.default = _default;
});