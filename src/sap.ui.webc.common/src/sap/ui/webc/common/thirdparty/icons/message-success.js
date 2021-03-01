sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "message-success";
	const pathData = "M383 163q3 3 1 8L248 382q-3 3-6 3t-4-1l-107-90q-5-3-1-9l27-38q2-3 5-3 2 0 4 2l65 49q2 1 5 1 4 0 5-3l99-162q2-4 6-4 2 0 4 2zm129 93q0 54-20 100.5t-54.5 81T356 492t-100 20q-54 0-100.5-20t-81-55T20 355.5 0 256t20.5-100 55-81.5T157 20t99-20q53 0 100 20t81.5 54.5T492 156t20 100zm-32 0q0-47-17.5-87.5t-48-71-71.5-48T256 32t-87 18-71.5 48.5-48 71T32 256q0 47 17.5 88t48 71 71.5 47.5 87 17.5q47 0 88-17.5t71-47.5 47.5-71 17.5-88z";
	const ltr = true;
	const accData = i18nDefaults.ICON_MESSAGE_SUCCESS;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var messageSuccess = { pathData, accData };

	return messageSuccess;

});
