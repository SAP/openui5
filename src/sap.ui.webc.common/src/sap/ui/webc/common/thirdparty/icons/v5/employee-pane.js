sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "employee-pane";
	const pathData = "M427 0c48 0 85 37 85 85v341c0 48-37 85-85 85H86c-48 0-85-37-85-85V85C1 37 38 0 86 0h341zm28 426V85c0-17-11-28-28-28H86c-17 0-28 11-28 28v341c0 17 11 28 28 28h341c17 0 28-11 28-28zM319 284c45 0 79 34 79 79v6c0 17-11 28-28 28H143c-17 0-29-11-29-28v-6c0-45 35-79 80-79h125zm-63-171c32 0 57 26 57 57s-25 57-57 57c-31 0-56-26-56-57s25-57 56-57z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
