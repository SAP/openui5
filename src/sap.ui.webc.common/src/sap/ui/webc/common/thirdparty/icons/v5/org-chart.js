sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "org-chart";
	const pathData = "M484 341c17 0 28 11 28 28v113c0 17-11 29-28 29H313c-17 0-28-12-28-29V369c0-17 11-28 28-28h57v-57H143v57h57c17 0 28 11 28 28v113c0 17-11 29-28 29H29c-17 0-28-12-28-29V369c0-17 11-28 28-28h57v-86c0-17 11-28 29-28h113v-57h-85c-17 0-28-11-28-28V28c0-17 11-28 28-28h227c17 0 28 11 28 28v114c0 17-11 28-28 28h-85v57h113c17 0 29 11 29 28v86h57zM171 57v56h171V57H171zm0 397v-57H58v57h113zm284 0v-57H342v57h113z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
