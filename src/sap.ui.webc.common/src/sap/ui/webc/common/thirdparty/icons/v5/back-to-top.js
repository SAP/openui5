sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "back-to-top";
	const pathData = "M279.5 125l110 111c12 11 12 28 0 40-11 11-28 11-40 0l-65-66v273c0 17-11 28-28 28s-29-11-29-28V210l-65 66c-11 11-28 11-40 0-11-12-11-29 0-40l111-111c7-6 11-11 23-11 11 0 17 5 23 11zm204-125c17 0 28 12 28 29s-11 28-28 28h-454c-17 0-29-11-29-28s12-29 29-29h454z";
	const ltr = false;
	const accData = i18nDefaults.ICON_BACK_TO_TOP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
