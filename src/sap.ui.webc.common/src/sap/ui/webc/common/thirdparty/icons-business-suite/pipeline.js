sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v1/pipeline", "./v2/pipeline"], function (_exports, _Theme, _pipeline, _pipeline2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pipeline.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pipeline.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pipeline.pathData : _pipeline2.pathData;
  _exports.pathData = pathData;
  var _default = "business-suite/pipeline";
  _exports.default = _default;
});