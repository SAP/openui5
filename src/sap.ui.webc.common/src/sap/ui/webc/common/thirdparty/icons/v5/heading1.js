sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "heading1";
	const pathData = "M238.5 71c21 0 35 14 35 35v340c0 21-14 34-35 34-20 0-34-13-34-34V310h-136v136c0 21-13 34-34 34-20 0-34-13-34-34V106c0-21 14-35 34-35 21 0 34 14 34 35v136h136V106c0-21 14-35 34-35zm259 75c11 7 14 17 14 28v272c0 21-14 34-34 34-21 0-34-13-34-34V221l-58 21c-17 7-38-4-44-21-7-17 3-37 20-44l102-34c14-7 24-3 34 3z";
	const ltr = true;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var pathDataV4 = { pathData };

	return pathDataV4;

});
