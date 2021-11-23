sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "move";
	const pathData = "M504.25 238c10 10 10 25 0 36l-77 76c-10 10-25 10-36 0-10-10-10-25 0-36l34-33h-143v143l33-33c10-10 25-10 36 0 10 10 10 26 0 36l-77 77c-10 10-26 10-36 0l-76-77c-11-10-11-26 0-36 10-10 25-10 35 0l34 33V281h-144l34 33c10 11 10 26 0 36-11 10-26 10-36 0l-77-76c-10-11-10-26 0-36l77-77c10-10 25-10 36 0 10 10 10 26 0 36l-34 33h144V87l-34 33c-10 11-25 11-35 0-11-10-11-25 0-35l76-77c10-10 26-10 36 0l77 77c10 10 10 25 0 35-11 11-26 11-36 0l-33-33v143h143l-34-33c-10-10-10-26 0-36 11-10 26-10 36 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_MOVE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var pathDataV4 = { pathData, accData };

	return pathDataV4;

});
