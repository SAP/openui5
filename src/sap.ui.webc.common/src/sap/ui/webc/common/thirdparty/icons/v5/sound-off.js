sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "sound-off";
	const pathData = "M241 45c10 3 15 13 15 23v358c0 10-5 21-15 23-4 2-7 3-11 3-6 0-12-3-17-8l-95-94H26c-15 0-25-11-25-26V171c0-16 10-26 25-26h92l95-94c5-6 11-8 18-8 3 0 7 1 10 2zm-36 320V130l-58 59c-6 5-11 7-18 7H52v102h77c7 0 12 3 18 8zm299-59c5 5 8 12 8 18s-3 13-8 18-11 8-18 8c-6 0-12-3-17-8l-59-59-59 59c-5 5-12 8-18 8s-13-3-18-8-7-12-7-18 2-13 7-18l59-59-59-58c-5-6-7-12-7-18 0-7 2-13 7-18s12-8 18-8 13 3 18 8l59 59 59-59c5-5 11-8 17-8 7 0 13 3 18 8s8 11 8 18c0 6-3 12-8 18l-58 58z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
