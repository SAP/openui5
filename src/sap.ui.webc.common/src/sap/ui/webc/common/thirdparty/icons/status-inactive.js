sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "status-inactive";
	const pathData = "M256 0l256 256-256 256L0 256zM91 256l165 166 166-166L256 91z";
	const ltr = false;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var statusInactive = { pathData };

	return statusInactive;

});
