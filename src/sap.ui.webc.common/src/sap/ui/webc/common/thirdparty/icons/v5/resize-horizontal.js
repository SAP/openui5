sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize-horizontal";
	const pathData = "M205.25 20c15 0 26 10 26 25v409c0 15-11 26-26 26s-26-11-26-26V45c0-15 11-25 26-25zm102 0c16 0 26 10 26 25v409c0 15-10 26-26 26-15 0-25-11-25-26V45c0-15 10-25 25-25zm-186 135c10 10 10 26 0 36l-59 59 59 58c10 11 10 26 0 36-11 10-26 10-36 0l-77-76c-10-11-10-26 0-36l77-77c10-10 25-10 36 0zm383 77c10 10 10 25 0 36l-77 76c-10 10-25 10-36 0-10-10-10-25 0-36l59-58-59-59c-10-10-10-26 0-36 11-10 26-10 36 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE_HORIZONTAL;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
