sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "zoom-in";
	const pathData = "M313.375 199c17 0 28 12 28 29s-11 28-28 28h-57v57c0 17-11 28-29 28-17 0-28-11-28-28v-57h-57c-17 0-28-11-28-28s11-29 28-29h57v-56c0-17 11-29 28-29 18 0 29 12 29 29v56h57zm190 264c11 12 11 29 0 40-11 12-29 12-40 0l-96-96c-40 31-88 48-140 48-124 0-227-102-227-227s103-227 227-227c125 0 228 102 228 227 0 51-17 99-49 139zm-446-235c0 93 77 170 170 170 94 0 171-77 171-170 0-94-77-171-171-171-93 0-170 77-170 171z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ZOOM_IN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
