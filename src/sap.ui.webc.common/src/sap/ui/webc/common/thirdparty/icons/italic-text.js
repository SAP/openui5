sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "italic-text";
	const pathData = "M160 448L288 64h-64V32h192v32h-64L224 448h64v32H96v-32h64z";
	const ltr = true;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var italicText = { pathData };

	return italicText;

});
