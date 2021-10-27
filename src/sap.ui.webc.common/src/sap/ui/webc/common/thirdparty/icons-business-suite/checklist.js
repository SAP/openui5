sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons'], function (Icons) { 'use strict';

	const name = "checklist";
	const pathData = "M96.5 160V0h256v64h-160v96h-96zm128-64h256v192l-128 128-32-32V160h-96V96zm64 96v192l-128 128-128-128V192h256z";
	const ltr = false;
	const collection = "business-suite";
	const packageName = "@ui5/webcomponents-icons-business-suite";
	Icons.registerIcon(name, { pathData, ltr, collection, packageName });
	var checklist = { pathData };

	return checklist;

});
