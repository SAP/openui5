sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "blank-tag";
	const pathData = "M509 277v219q0 7-5 11.5t-11 4.5H274q-6 0-11-5L9 253q-5-5-5-11t5-11L228 11q5-5 12-5 6 0 11 5l253 254q5 5 5 12zm-35 8L240 50 49 242l234 234h190zm-73 83q18 0 26.5 11t8.5 24.5-8.5 24.5-26.5 11q-14 0-25-10.5T365 403t11-25 25-10z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var blankTag = { pathData };

	return blankTag;

});
