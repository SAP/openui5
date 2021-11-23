sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "thing-type";
	const pathData = "M461 322V157c0-16-12-29-26-29H179c-14 0-25 13-25 29v264l58-62c5-5 11-8 18-8h205c14 0 26-13 26-29zM51 77v245l51-51V157c0-44 35-80 77-80h179c0-14-11-26-25-26H77c-14 0-26 12-26 26zm359 0h25c43 0 77 36 77 80v165c0 44-34 80-77 80H242l-95 102c-5 5-12 8-19 8-3 0-6-1-9-2-10-4-17-13-17-24V343l-58 59c-5 5-12 8-18 8-4 0-7-1-10-2-10-4-16-14-16-24V77C0 34 34 0 77 0h256c42 0 77 34 77 77z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
