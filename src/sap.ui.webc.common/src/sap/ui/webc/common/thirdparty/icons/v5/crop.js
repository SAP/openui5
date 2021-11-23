sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "crop";
	const pathData = "M210 139c-14 0-24-9-24-23s10-24 24-24h139c39 0 70 31 70 70v140c0 13-10 23-24 23s-23-10-23-23V162c0-14-9-23-23-23H210zm278 232c14 0 24 9 24 23s-10 24-24 24h-69v69c0 14-10 24-24 24s-23-10-23-24v-69H163c-39 0-70-31-70-70V139H24c-14 0-23-9-23-23s9-24 23-24h69V23c0-14 10-23 24-23s23 9 23 23v325c0 14 9 23 23 23h325z";
	const ltr = false;
	const accData = i18nDefaults.ICON_CROP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
