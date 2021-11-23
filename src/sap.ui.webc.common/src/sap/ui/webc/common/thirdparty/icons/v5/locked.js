sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "locked";
	const pathData = "M384 204c44 0 77 34 77 77v153c0 44-33 77-77 77H129c-44 0-77-33-77-77V281c0-43 33-77 77-77v-76C129 56 185 0 256 0c72 0 128 56 128 128v76zm-204-76v76h153v-76c0-44-33-77-77-77-43 0-76 33-76 77zm230 306V281c0-15-11-25-26-25H129c-16 0-26 10-26 25v153c0 16 10 26 26 26h255c15 0 26-10 26-26zM256 307c29 0 51 22 51 51 0 28-22 51-51 51-28 0-51-23-51-51 0-29 23-51 51-51z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
