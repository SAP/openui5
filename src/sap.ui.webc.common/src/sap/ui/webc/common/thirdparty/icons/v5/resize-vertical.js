sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize-vertical";
	const pathData = "M197.5 121c-10 10-25 10-36 0-10-10-10-26 0-36l77-77c10-10 26-10 36 0l76 77c11 10 11 26 0 36-10 10-25 10-35 0l-59-59zm118 271c10-11 25-11 35 0 11 10 11 25 0 35l-76 77c-10 10-26 10-36 0l-77-77c-10-10-10-25 0-35 11-11 26-11 36 0l59 58zm-263-161c-16 0-26-11-26-26s10-25 26-25h408c16 0 26 10 26 25s-10 26-26 26h-408zm408 51c16 0 26 10 26 25 0 16-10 26-26 26h-408c-16 0-26-10-26-26 0-15 10-25 26-25h408z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE_VERTICAL;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
