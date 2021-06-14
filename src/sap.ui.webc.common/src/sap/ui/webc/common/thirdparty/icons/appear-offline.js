sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "appear-offline";
	const pathData = "M256 0q53 0 100 20t81.5 54.5T492 156t20 100-20 99.5-54.5 81.5-81.5 55-100 20-99.5-20T75 437t-55-81.5T0 256t20-100 55-81.5T156.5 20 256 0zm0 426q36 0 67-13.5t54-36.5 36.5-54 13.5-66q0-36-13.5-67T377 135t-54-36.5T256 85q-35 0-66 13.5T136 135t-36.5 54T86 256q0 35 13.5 66t36.5 54 54 36.5 66 13.5z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var appearOffline = { pathData };

	return appearOffline;

});
