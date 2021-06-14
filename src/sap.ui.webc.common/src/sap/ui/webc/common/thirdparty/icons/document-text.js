sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "document-text";
	const pathData = "M416 0q14 0 23 9.5t9 22.5v448q0 14-9 23t-22 9H97q-14 0-23.5-9T64 480V128L192 0h224zm1 480l-1-448H224v96q0 14-9.5 23t-22.5 9H96v320h321zm-81-96q16 0 16 16 0 6-4.5 11t-11.5 5H176q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5h160zm0-64q16 0 16 16 0 6-4.5 11t-11.5 5H176q-6 0-11-5t-5-11q0-7 5-11.5t11-4.5h160z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var documentText = { pathData };

	return documentText;

});
