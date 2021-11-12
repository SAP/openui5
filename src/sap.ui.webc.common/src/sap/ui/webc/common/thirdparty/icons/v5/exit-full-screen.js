sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "exit-full-screen";
	const pathData = "M466.5 149c14 0 26 11 26 26 0 14-12 25-26 25h-127c-15 0-26-11-26-25V47c0-14 11-26 26-26 14 0 25 12 25 26v66l70-70c5-5 12-8 19-8 6 0 13 3 18 8 10 10 10 26 0 36l-71 70h66zm-255-77c14 0 25 12 25 26s-11 25-25 25h-77v77c0 14-11 26-25 26-15 0-26-12-26-26V98c0-14 11-26 26-26h102zm204 205c14 0 26 11 26 25v103c0 14-12 25-26 25h-102c-14 0-26-11-26-25 0-15 12-26 26-26h77v-77c0-14 11-25 25-25zm-230 25c14 0 26 12 26 26v128c0 14-12 25-26 25s-25-11-25-25v-66l-71 70c-5 5-11 7-18 7-6 0-13-2-18-7-10-10-10-26 0-36l71-71h-67c-14 0-25-11-25-25s11-26 25-26h128z";
	const ltr = false;
	const accData = i18nDefaults.ICON_EXIT_FULL_SCREEN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
