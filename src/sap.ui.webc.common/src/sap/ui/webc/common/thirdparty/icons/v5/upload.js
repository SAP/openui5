sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "upload";
	const pathData = "M471.5 459c16 0 27 10 27 27 0 16-11 26-27 26h-430c-16 0-27-10-27-26 0-17 11-27 27-27h430zm-304-304c-11 11-27 10-38 0-10-11-10-27 0-38l105-105c6-5 11-11 22-11s15 6 21 11l105 105c11 11 11 27 0 38-11 10-27 10-37 0l-62-62v258c0 16-11 27-27 27s-27-11-27-27V93z";
	const ltr = false;
	const accData = i18nDefaults.ICON_UPLOAD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
