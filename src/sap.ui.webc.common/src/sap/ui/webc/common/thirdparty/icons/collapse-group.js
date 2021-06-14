sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "collapse-group";
	const pathData = "M267.5 120q-12-11-23 0l-159 157q-10 10-23 10t-22-10q-10-9-10-22t10-23l193-191q9-9 22.5-9t22.5 9l192 192q10 10 10 23t-10 23q-9 9-22.5 9t-22.5-9zm0 193q-12-11-23 0l-159 157q-10 10-23 10t-22-10q-10-9-10-22t10-23l193-191q9-9 22.5-9t22.5 9l192 192q10 10 10 23t-10 23q-9 9-22.5 9t-22.5-9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE_GROUP;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var collapseGroup = { pathData, accData };

	return collapseGroup;

});
