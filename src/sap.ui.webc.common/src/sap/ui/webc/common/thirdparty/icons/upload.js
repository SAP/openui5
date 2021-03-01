sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "upload";
	const pathData = "M480 448q13 0 22.5 9.5T512 480q0 14-9.5 23t-22.5 9H32q-14 0-23-9t-9-23q0-13 9-22.5t23-9.5h448zm-98-337q11 12 0 23-5 5-11.5 5t-11.5-5l-87-87v321q0 16-16 16t-16-16V49l-85 85q-5 5-11 5t-11-5q-12-11 0-23L235 10q9-10 22-10t23 10z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UPLOAD;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var upload = { pathData, accData };

	return upload;

});
