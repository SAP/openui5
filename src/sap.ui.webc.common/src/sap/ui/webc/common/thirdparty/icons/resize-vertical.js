sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize-vertical";
	const pathData = "M496 288q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zm0-96q6 0 11 4.5t5 11.5-5 11.5-11 4.5H16q-16 0-16-16t16-16h480zM263 475q-6 6-11 0l-95-87q-5-5-11.5-5t-11.5 5-5 11.5 5 11.5l101 92q9 9 22 9t23-9l99-92q5-5 5-11t-5-11q-12-12-23 0zm93-352q11 12 23 0 5-5 5-11t-5-11L280 9q-10-9-23-9t-22 9l-101 92q-5 5-5 11.5t5 11.5 11.5 5 11.5-5l95-87q5-6 11 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE_VERTICAL;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var resizeVertical = { pathData, accData };

	return resizeVertical;

});
