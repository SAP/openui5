sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "home";
	const pathData = "M467 157c16 16 27 37 27 61v214c0 45-35 79-80 79H97c-44 0-79-34-79-79V218c0-24 8-45 27-61L203 20c32-26 77-26 106 0zM296 459V300h-80v159h80zm145-27l-3-214c0-8-3-16-8-21L272 60c-11-8-24-8-35 0L79 197c-5 5-8 13-8 21v214c0 16 11 27 26 27h66V300c0-29 24-53 53-53h80c29 0 52 24 52 53v159h66c16 0 27-11 27-27z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
