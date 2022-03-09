sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/geographic-bubble-chart', './v4/geographic-bubble-chart'], function (Theme, geographicBubbleChart$2, geographicBubbleChart$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? geographicBubbleChart$1 : geographicBubbleChart$2;
	var geographicBubbleChart = { pathData };

	return geographicBubbleChart;

});
