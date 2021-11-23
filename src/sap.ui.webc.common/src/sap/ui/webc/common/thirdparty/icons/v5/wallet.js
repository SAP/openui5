sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "wallet";
	const pathData = "M512 86v340c0 49-37 86-85 86H86c-48 0-85-37-85-86V86C1 37 38 1 86 1h341c48 0 85 36 85 85zM86 455h341c17 0 28-12 28-29v-28H313c-48 0-85-37-85-85V199c0-48 37-85 85-85h142V86c0-17-11-29-28-29H86c-17 0-28 12-28 29v340c0 17 11 29 28 29zm369-284H313c-17 0-28 11-28 28v114c0 17 11 28 28 28h142V171zm-85 42c23 0 42 19 42 43s-19 43-42 43c-24 0-43-19-43-43s19-43 43-43z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
