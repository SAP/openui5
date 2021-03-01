sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "addresses";
	const pathData = "M32 256l96-96 96 96v192H32V256zm256 192V256l96-96 96 96v192H288zM0 240v-42L128 64l128 128L384 64l64 61V64h32v91l32 30v55L384 121 256 240 128 121zm320 29v147h32v-96h64v96h32V269l-64-64zM96 416v-96h64v96h32V269l-64-64-64 64v147h32z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var addresses = { pathData };

	return addresses;

});
