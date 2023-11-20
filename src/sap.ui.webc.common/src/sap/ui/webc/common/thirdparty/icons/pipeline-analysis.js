sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v4/pipeline-analysis", "./v5/pipeline-analysis"], function (_exports, _Theme, _pipelineAnalysis, _pipelineAnalysis2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _pipelineAnalysis.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _pipelineAnalysis.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isLegacyThemeFamily)() ? _pipelineAnalysis.pathData : _pipelineAnalysis2.pathData;
  _exports.pathData = pathData;
  var _default = "pipeline-analysis";
  _exports.default = _default;
});