sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "shield";
	const pathData = "M263 0l179 51c11 3 19 13 19 25v179c0 169-187 250-195 254-3 1-7 2-10 2-4 0-7-1-10-2-8-3-195-85-195-254V76c0-12 8-22 19-25L249 0c4-1 9-1 14 0zm146 95L281 59v166l128-18V95zM230 225V59L102 95v112zm-128 34c3 93 81 155 128 184V277zm179 18v166c48-30 126-92 128-184z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
