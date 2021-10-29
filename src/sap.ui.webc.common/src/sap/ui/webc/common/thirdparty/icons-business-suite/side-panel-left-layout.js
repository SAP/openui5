sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "side-panel-left-layout";
	const pathData = "M0 512V0h512v512H0zm480-32V32H160v448h320zM32 32v448h96V32H32z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var sidePanelLeftLayout = { pathData };

	return sidePanelLeftLayout;

});
