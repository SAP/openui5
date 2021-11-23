sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize";
	const pathData = "M85.5 227c-17 0-28-12-28-29V85c0-17 11-28 28-28h114c17 0 28 11 28 28s-11 28-28 28h-85v85c0 17-12 29-29 29zm341 57c17 0 28 11 28 28v114c0 17-11 28-28 28h-114c-17 0-28-11-28-28s11-29 28-29h85v-85c0-17 12-28 29-28zm57-284c17 0 28 11 28 28v142c0 17-11 28-28 28s-29-11-29-28V96l-357 358h73c17 0 29 11 29 28s-12 29-29 29h-142c-8 0-14-3-19-9-6-5-9-11-9-20V340c0-17 11-28 28-28s29 11 29 28v74l358-357h-74c-17 0-29-12-29-29s12-28 29-28h142z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
