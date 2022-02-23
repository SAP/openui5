sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "ipad-2";
	const pathData = "M465.5 30q20 0 33 13.5t13 33.5v325q0 19-13 32.5t-33 13.5h-418q-20 0-33.5-13.5T.5 402V77Q.5 57 14 43.5T47.5 30h418zm-395 372h372V77h-372v325z";
	const ltr = false;
	const accData = i18nDefaults.ICON_IPAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
