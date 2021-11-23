sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "validate";
	const pathData = "M256 51L102 95v160c0 115 118 184 154 202 35-18 153-87 153-202V95zm0 460c-4 0-7-1-10-2-8-3-195-85-195-254V76c0-12 8-22 19-25L249 0c4-1 9-1 14 0l179 51c11 3 19 13 19 25v179c0 169-187 251-195 254-3 1-7 2-10 2zm-26-205c-6 0-13-2-18-7l-51-52c-10-10-10-26 0-36s26-10 36 0l33 33 85-84c10-10 26-10 36 0s10 26 0 36L248 299c-5 5-11 7-18 7z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
