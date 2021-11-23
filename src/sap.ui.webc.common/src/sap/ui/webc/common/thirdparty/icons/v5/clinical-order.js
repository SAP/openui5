sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "clinical-order";
	const pathData = "M435 1c15 0 26 10 26 26v153c0 15-11 25-26 25s-26-10-26-25V52H241l-10 10v67c0 28-23 51-52 51h-66l-10 10v271h25c16 0 26 10 26 26 0 15-10 25-26 25H77c-15 0-25-10-25-25V180c0-8 2-13 7-18L213 9c5-5 10-8 18-8h204zm0 281c15 0 26 10 26 26v102c0 15-11 25-26 25h-51v52c0 15-10 25-26 25H256c-15 0-25-10-25-25v-52h-52c-15 0-25-10-25-25V308c0-16 10-26 25-26h52v-51c0-15 10-26 25-26h102c16 0 26 11 26 26v51h51zm-26 102v-51h-51c-15 0-25-10-25-25v-51h-51v51c0 15-11 25-26 25h-51v51h51c15 0 26 11 26 26v51h51v-51c0-15 10-26 25-26h51z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
