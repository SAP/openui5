sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "draw-rectangle";
	const pathData = "M512 256c0 18-10 36-26 44v117c16 8 26 26 26 44 0 28-23 51-51 51-18 0-36-10-44-26H300c-8 16-26 26-44 26s-35-10-43-26H95c-7 16-25 26-43 26-28 0-51-23-51-51 0-18 10-36 25-44V300c-15-8-25-26-25-44s10-36 25-43V95C11 88 1 70 1 52 1 24 24 1 52 1c18 0 36 10 43 25h118c8-15 25-25 43-25s36 10 44 25h117c8-15 26-25 44-25 28 0 51 23 51 51 0 18-10 36-26 43v118c16 7 26 25 26 43zm-77 44c-15-8-25-26-25-44s10-36 25-43V95c-8-5-13-10-18-18H300c-8 16-26 26-44 26s-35-10-43-26H95c-5 8-10 13-18 18v118c16 7 26 25 26 43s-10 36-26 44v117c8 5 13 10 18 18h118c8-15 25-25 43-25s36 10 44 25h117c5-8 10-13 18-18V300z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
