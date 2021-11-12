sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tag-cloud-chart', './v4/tag-cloud-chart'], function (Theme, tagCloudChart$2, tagCloudChart$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? tagCloudChart$1 : tagCloudChart$2;
	var tagCloudChart = { pathData };

	return tagCloudChart;

});
