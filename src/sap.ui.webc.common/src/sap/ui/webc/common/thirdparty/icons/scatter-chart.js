sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "scatter-chart";
	const pathData = "M80 224h190V33h36v191h126v-32h-32v-32h32v-32h32v32h32v32h-32v32h32v31H306v162h-36V255h-62v33h32v32h-32v32h-32v-32h-32v-32h32v-33H80v-31zM17 480V32h31v416h448v32H17zm94-416h33V32h32v32h32v32h-32v32h-32V96h-33V64zm257 256h32v-32h32v32h32v32h-32v32h-32v-32h-32v-32zm0-255V33h32v32h32v32h-32v32h-32V97h-32V65h32z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var scatterChart = { pathData };

	return scatterChart;

});
