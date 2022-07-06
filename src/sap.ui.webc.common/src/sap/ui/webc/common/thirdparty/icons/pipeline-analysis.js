sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pipeline-analysis', './v4/pipeline-analysis'], function (exports, Theme, pipelineAnalysis$1, pipelineAnalysis$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pipelineAnalysis$1.pathData : pipelineAnalysis$2.pathData;
	var pipelineAnalysis = "pipeline-analysis";

	exports.accData = pipelineAnalysis$1.accData;
	exports.ltr = pipelineAnalysis$1.ltr;
	exports.default = pipelineAnalysis;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
