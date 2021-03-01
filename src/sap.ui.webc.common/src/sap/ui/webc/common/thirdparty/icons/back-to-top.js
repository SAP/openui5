sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "back-to-top";
	const pathData = "M480 0q14 0 23 9.5t9 22.5q0 14-9 23t-23 9H32q-14 0-23-9T0 32Q0 19 9 9.5T32 0h448zm-98 239q11 12 0 23-12 11-23 0l-87-87v321q0 16-16 16t-16-16V177l-85 85q-5 5-11 5t-11-5q-12-11 0-23l102-101q9-10 22-10t23 10z";
	const ltr = false;
	const accData = i18nDefaults.ICON_BACK_TO_TOP;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var backToTop = { pathData, accData };

	return backToTop;

});
