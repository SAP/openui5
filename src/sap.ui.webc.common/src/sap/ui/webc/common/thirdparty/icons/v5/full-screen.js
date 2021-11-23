sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "full-screen";
	const pathData = "M461 10c14 0 25 12 25 26v128c0 14-11 25-25 25s-26-11-26-25V98l-70 70c-5 5-12 7-18 7-7 0-13-2-18-7-10-10-10-26 0-36l70-71h-66c-14 0-26-11-26-25s12-26 26-26h128zM205 61c14 0 26 12 26 26s-12 25-26 25h-76v77c0 14-12 26-26 26s-26-12-26-26V87c0-14 12-26 26-26h102zm205 205c14 0 25 11 25 25v103c0 14-11 25-25 25H307c-14 0-25-11-25-25 0-15 11-26 25-26h77v-77c0-14 12-25 26-25zM180 419c14 0 25 12 25 26s-11 25-25 25H52c-14 0-26-11-26-25V317c0-14 12-26 26-26s25 12 25 26v66l71-70c5-5 12-8 18-8 7 0 13 3 18 8 10 10 10 26 0 36l-70 70h66z";
	const ltr = false;
	const accData = i18nDefaults.ICON_FULL_SCREEN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
