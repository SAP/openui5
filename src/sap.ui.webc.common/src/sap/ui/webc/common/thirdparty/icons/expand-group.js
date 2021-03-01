sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "expand-group";
	const pathData = "M425.5 234q9-9 22.5-9t22.5 9q10 10 10 23t-10 23l-192 192q-9 9-22.5 9t-22.5-9l-193-191q-10-10-10-23t10-22q9-10 22-10t23 10l159 157q11 11 23 0zm0-193q9-9 22.5-9t22.5 9q10 10 10 23t-10 23l-192 192q-9 9-22.5 9t-22.5-9L40.5 88q-10-10-10-23t10-22q9-10 22-10t23 10l159 157q5 5 11.5 5t11.5-5z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXPAND_GROUP;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var expandGroup = { pathData, accData };

	return expandGroup;

});
