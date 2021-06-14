sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "overflow";
	const pathData = "M448 192q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zm-192-96q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9zM64 192q26 0 45 19t19 45-19 45-45 19-45-19-19-45 19-45 45-19zm0 96q14 0 23-9t9-23-9-23-23-9-23 9-9 23 9 23 23 9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_OVERFLOW;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var overflow = { pathData, accData };

	return overflow;

});
