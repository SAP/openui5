sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "picture";
	const pathData = "M448 32q14 0 23 9t9 23v384q0 13-9 22.5t-23 9.5H64q-14 0-23-9.5T32 448V64q0-14 9-23t23-9h384zm0 32H64v320h384V64zM320 192l96 160H224zm-94 96H96V128h140q-5 11-8.5 22.5T224 176q0 20 7 38t19 32zm42-71q-5-9-8.5-19.5T256 176q0-34 23.5-57T336 96q34 0 57 23t23 57q0 19-8 35t-22 27l-66-109z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var picture = { pathData };

	return picture;

});
