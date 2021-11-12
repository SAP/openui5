sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "badge";
	const pathData = "M409 256V96L256 52 102 96v160c0 115 118 184 154 202 35-18 153-87 153-202zM263 1l179 51c11 3 19 13 19 25v179c0 169-187 251-195 254-3 1-7 2-10 2-4 0-7-1-10-2-8-3-195-85-195-254V77c0-12 8-22 19-25L249 1c4-1 9-1 14 0zm-42 220l10-47c2-12 13-20 25-20s23 8 25 20l9 47 48 10c12 2 20 13 20 25s-8 23-20 25l-48 10-9 47c-2 12-13 20-25 20s-23-8-25-20l-10-47-47-10c-12-2-21-13-21-25s9-23 21-25z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
