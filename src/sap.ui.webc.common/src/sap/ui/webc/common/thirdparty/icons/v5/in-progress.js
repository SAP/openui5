sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "in-progress";
	const pathData = "M341 397c15 0 29-13 29-28 0-7-3-14-9-20l-76-77V142c0-17-12-29-29-29s-28 12-28 29v142c0 8 3 14 8 19l85 86c6 5 13 8 20 8zM427 0c48 0 85 37 85 85v341c0 48-37 85-85 85H86c-48 0-85-37-85-85V85C1 37 38 0 86 0h341zm28 426V85c0-17-11-29-28-29H86c-17 0-29 12-29 29v341c0 17 12 28 29 28h341c17 0 28-11 28-28z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
