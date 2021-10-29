sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "side-top-panel-layout";
	const pathData = "M0 512V0h512v512H0zm128-32V32H32v448h96zm32-448v96h320V32H160zm0 448h320V160H160v320z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var sideTopPanelLayout = { pathData };

	return sideTopPanelLayout;

});
