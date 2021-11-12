sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "hello-world";
	const pathData = "M256-1c141 0 256 115 256 256S397 511 256 511H26c-10 0-18-5-23-13-4-8-4-18 1-26l42-70C16 359 0 307 0 255 0 114 115-1 256-1zm145 400c37-37 60-88 60-144 0-86-53-159-128-190v36c0 14-12 26-26 26h-77v51c0 14-11 26-25 26h-41l51 51h92c14 0 26 11 26 26v76c37 0 58 20 68 42zM97 384c7 8 7 20 2 29l-28 47h159v-55c-31-10-46-38-50-62L55 218c-2 12-4 24-4 37 0 47 16 92 46 129z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
