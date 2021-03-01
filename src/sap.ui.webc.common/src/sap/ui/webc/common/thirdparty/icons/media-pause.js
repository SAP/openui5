sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "media-pause";
	const pathData = "M160 64q0-14 9.5-23t22.5-9q14 0 23 9t9 23v385q0 13-9 22.5t-23 9.5q-13 0-22.5-9.5T160 449V64zm128 0q0-14 9.5-23t22.5-9q14 0 23 9t9 23v385q0 13-9 22.5t-23 9.5q-13 0-22.5-9.5T288 449V64z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var mediaPause = { pathData };

	return mediaPause;

});
