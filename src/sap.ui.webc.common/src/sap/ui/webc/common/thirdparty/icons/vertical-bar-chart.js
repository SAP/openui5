sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "vertical-bar-chart";
	const pathData = "M352 408V40q0-8 8-8h48q8 0 8 8v368q0 8-8 8h-48q-8 0-8-8zM224 168q0-8 8-8h48q8 0 8 8v240q0 8-8 8h-48q-8 0-8-8V168zM32 448h448v32H32v-32zm72-224h48q8 0 8 8v176q0 8-8 8h-48q-8 0-8-8V232q0-8 8-8z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var verticalBarChart = { pathData };

	return verticalBarChart;

});
