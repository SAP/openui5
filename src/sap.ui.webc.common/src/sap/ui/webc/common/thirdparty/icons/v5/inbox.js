sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "inbox";
	const pathData = "M410 52c43 0 76 33 76 77v306c0 44-33 77-76 77H103c-43 0-77-33-77-77V129c0-44 34-77 77-77 15 0 26 10 26 25 0 16-11 26-26 26s-25 10-25 26v153h102c15 0 25 10 25 25 0 29 23 52 51 52 29 0 52-23 52-52 0-15 10-25 25-25h102V129c0-16-10-26-25-26-16 0-26-10-26-26 0-15 10-25 26-25zm0 409c15 0 25-10 25-26V333h-79c-13 43-51 77-100 77-48 0-89-34-99-77H78v102c0 16 10 26 25 26h307zM198 136l33 33-1-143c0-15 11-25 26-25s26 10 26 25v143l33-33c10-10 26-10 36 0s10 26 0 36l-77 77c-10 10-25 10-35 0l-77-77c-10-10-10-26 0-36s25-10 36 0z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
