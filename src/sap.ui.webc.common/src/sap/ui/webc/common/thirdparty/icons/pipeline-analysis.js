sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pipeline-analysis', './v4/pipeline-analysis'], function (Theme, pipelineAnalysis$2, pipelineAnalysis$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pipelineAnalysis$1 : pipelineAnalysis$2;
	var pipelineAnalysis = { pathData };

	return pipelineAnalysis;

});
