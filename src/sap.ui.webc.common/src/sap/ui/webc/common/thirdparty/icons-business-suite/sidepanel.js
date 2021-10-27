sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sidepanel";
	const pathData = "M0 512V0h512v512H0zM32 32v448h320V32H32zm448 448V32h-96v448h96z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var sidepanel = { pathData };

	return sidepanel;

});
