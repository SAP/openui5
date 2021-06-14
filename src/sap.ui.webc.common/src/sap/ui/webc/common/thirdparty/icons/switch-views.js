sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "switch-views";
	const pathData = "M384 128q13 0 22.5 9.5T416 160v320q0 14-9.5 23t-22.5 9H160q-14 0-23-9t-9-23V160q0-13 9-22.5t23-9.5h224zm0 32H160v320h224V160zM32 352h64v32H32q-14 0-23-9t-9-23V32Q0 19 9 9.5T32 0h224q13 0 22.5 9.5T288 32H32v320zM480 64q13 0 22.5 9.5T512 96v320q0 14-9.5 23t-22.5 9h-32v-32h32V96H224q0-13 9-22.5t23-9.5h224z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var switchViews = { pathData };

	return switchViews;

});
