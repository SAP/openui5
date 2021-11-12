sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "forward";
	const pathData = "M355 11l146 146c7 8 11 16 11 26s-4 18-11 25L356 354c-8 8-17 11-27 11-9 0-18-3-26-11-7-7-10-15-10-26 0-10 3-18 10-25l85-83h-96c-30 0-59 5-85 17-27 11-50 27-70 46-20 20-35 43-47 70-11 26-17 55-17 85v37c0 9-3 18-10 25s-15 11-26 11c-10 0-18-4-26-11-7-7-10-16-10-25v-37c0-40 7-78 23-113 15-35 36-66 63-93 26-26 56-47 92-62 35-16 73-23 113-23h96l-85-84c-7-8-11-17-11-27 0-9 4-18 11-25s15-11 25-11 19 4 27 11z";
	const ltr = false;
	const accData = i18nDefaults.ICON_FORWARD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
