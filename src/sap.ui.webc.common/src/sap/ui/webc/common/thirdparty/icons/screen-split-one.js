sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "screen-split-one";
	const pathData = "M32 64q0-14 9-23t23-9h384q14 0 23 9t9 23v384q0 13-9 22.5t-23 9.5H64q-14 0-23-9.5T32 448V64zm416 384V64H192v384h256zm-288 0V64H64v384h96z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var screenSplitOne = { pathData };

	return screenSplitOne;

});
