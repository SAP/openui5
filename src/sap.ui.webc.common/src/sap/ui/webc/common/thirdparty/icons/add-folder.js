sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "add-folder";
	const pathData = "M0 448V64q0-9 4-16 3-6 9.5-11T32 32h180q7 0 12 5l24 27h232q11 0 18 5t10 11q4 7 4 16v128h-32v-96q-2-13-10-22.5T448 96H231q-7 0-12-5l-22-22q-5-5-12-5H64q-12 0-18.5 5T36 80q-4 7-4 16v320q0 13 5 19t11 9q7 4 16 4h160v32H32q-9 0-16-4-6-3-11-9.5T0 448zm288-64h96v-96h32v96h96v32h-96v96h-32v-96h-96v-32z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var addFolder = { pathData };

	return addFolder;

});
