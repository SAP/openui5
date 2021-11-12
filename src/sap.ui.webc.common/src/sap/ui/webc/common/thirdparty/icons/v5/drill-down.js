sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "drill-down";
	const pathData = "M234 183L106 55c-12-13-12-32 0-45 13-12 32-12 45 0l105 106L362 10c13-12 32-12 45 0 12 13 12 32 0 45L279 183c-13 13-32 13-45 0zm128-13c13-13 32-13 45 0 12 13 12 32 0 45L279 342c-13 13-32 13-45 0L106 215c-12-13-12-32 0-45 13-13 32-13 45 0l105 105zm0 160c13-13 32-13 45 0 12 12 12 32 0 44L279 502c-13 13-32 13-45 0L106 374c-12-12-12-32 0-44 13-13 32-13 45 0l105 105z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DRILL_DOWN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
