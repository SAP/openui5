sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "generate-shortcut";
	const pathData = "M435.5 22c43 0 76 33 76 76v307c0 43-33 76-76 76h-77c-15 0-25-10-25-25s10-26 25-26h77c15 0 25-10 25-25V175h-408v230c0 15 10 25 25 25h77c15 0 25 11 25 26s-10 25-25 25h-77c-43 0-77-33-77-76V98c0-43 34-76 77-76h358zm-383 102h408V98c0-15-10-25-25-25h-358c-15 0-25 10-25 25v26zm145 222c-10 10-25 10-36 0-10-10-10-25 0-36l77-76c10-11 26-11 36 0l76 76c11 11 11 26 0 36-10 10-25 10-35 0l-34-33v143c0 15-10 25-26 25-15 0-25-10-25-25V313z";
	const ltr = false;
	const accData = i18nDefaults.ICON_GENERATE_SHORTCUT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
