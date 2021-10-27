sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "top-panel-layout";
	const pathData = "M0 512V0h512v512H0zM32 32v96h448V32H32zm0 448h448V160H32v320z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var topPanelLayout = { pathData };

	return topPanelLayout;

});
