sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "blank-tag";
	const pathData = "M175 330c21 0 40-19 40-41 0-21-19-40-40-40-22 0-41 19-41 40 0 22 19 41 41 41zm256-229c46 0 81 35 81 81v215c0 46-35 81-81 81H164c-27 0-51-13-68-35L5 306c-6-8-6-22 0-30l91-140c17-22 41-35 68-35h267zm27 296V182c0-17-11-27-27-27H164c-8 0-16 5-22 10L61 289l81 124c6 9 14 11 22 11h267c16 0 27-11 27-27z";
	const ltr = false;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
