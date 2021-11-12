sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "add-contact";
	const pathData = "M414 244c15 0 25 10 25 25v170c0 42-32 73-73 73H74c-42 0-73-31-73-73V147c0-41 31-73 73-73h170c15 0 24 10 24 24 0 15-9 25-24 25H74c-15 0-25 10-25 24v292c0 15 10 24 25 24h292c14 0 24-9 24-24V269c0-15 10-25 24-25zm73-170c15 0 25 10 25 24 0 15-10 25-25 25h-48v48c0 15-10 25-25 25-14 0-24-10-24-25v-48h-49c-14 0-24-10-24-25 0-14 10-24 24-24h49V25c0-14 10-24 24-24 15 0 25 10 25 24v49h48zM122 415c-14 0-24-10-24-25v-4c0-37 29-69 68-69h107c39 0 68 32 68 69v4c0 15-9 25-24 25H122zm98-244c27 0 48 22 48 49s-21 49-48 49-49-22-49-49 22-49 49-49z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ADD_CONTACT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
