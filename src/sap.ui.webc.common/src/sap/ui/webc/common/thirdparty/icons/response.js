sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "response";
	const pathData = "M224 161q53 0 99.5 20t81.5 55 55 81.5 20 99.5v32q0 13-9 22.5t-23 9.5q-13 0-22.5-9.5T416 449v-32q0-40-15-75t-41-61-61-41-75-15h-83l74 73q9 9 9 22.5t-9 22.5q-10 10-23 10t-23-10L41 215q-9-9-9-22t9-23L170 42q10-10 23-10t22 10q10 9 10 22t-10 23l-74 74h83z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESPONSE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var response = { pathData, accData };

	return response;

});
