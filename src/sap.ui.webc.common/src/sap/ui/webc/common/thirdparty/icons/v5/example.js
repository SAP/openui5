sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "example";
	const pathData = "M256.5 0c-52 0-93 42-93 93s41 93 93 93c51 0 92-42 92-93s-41-93-92-93zm0 325c51 0 92 42 92 93s-41 93-92 93c-52 0-93-42-93-93s41-93 93-93zm0 140c25 0 46-21 46-47 0-25-21-46-46-46-26 0-47 21-47 46 0 26 21 47 47 47zm-163-302c51 0 93 42 93 93s-42 93-93 93-93-42-93-93 42-93 93-93zm0 139c26 0 46-21 46-46 0-26-20-47-46-47s-46 21-46 47c0 25 20 46 46 46zm325-139c51 0 93 42 93 93s-42 93-93 93-93-42-93-93 42-93 93-93zm0 139c26 0 47-21 47-46 0-26-21-47-47-47-25 0-46 21-46 47 0 25 21 46 46 46z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
