sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tag-cloud-chart', './v4/tag-cloud-chart'], function (exports, Theme, tagCloudChart$1, tagCloudChart$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? tagCloudChart$1.pathData : tagCloudChart$2.pathData;
	var tagCloudChart = "tag-cloud-chart";

	exports.accData = tagCloudChart$1.accData;
	exports.ltr = tagCloudChart$1.ltr;
	exports.default = tagCloudChart;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
