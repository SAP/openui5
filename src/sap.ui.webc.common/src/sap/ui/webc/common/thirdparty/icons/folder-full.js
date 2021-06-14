sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "folder-full";
	const pathData = "M480 64q11 0 18 5t10 11q4 7 4 16v352q0 12-5 18.5t-11 9.5q-7 4-16 4H32q-9 0-16-4-6-3-11-9.5T0 448V64q0-9 4-16 3-6 9.5-11T32 32h187l28 32h233z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var folderFull = { pathData };

	return folderFull;

});
