sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "zoom-out";
	const pathData = "M313.375 199c17 0 28 12 28 29s-11 28-28 28h-170c-18 0-29-11-29-28s11-29 29-29h170zm190 264c11 12 11 29 0 40-11 12-28 12-40 0l-96-96c-40 31-88 48-139 48-125 0-227-102-227-227s102-227 227-227 227 102 227 227c0 51-17 99-48 139zm-446-235c0 94 77 170 171 170 93 0 170-76 170-170s-77-170-170-170c-94 0-171 76-171 170z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ZOOM_OUT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
