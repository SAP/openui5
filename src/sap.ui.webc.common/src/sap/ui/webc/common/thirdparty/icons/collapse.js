sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "collapse";
	const pathData = "M144 240h256v32H144v-32zM464 32q13 0 22.5 9.5T496 64v384q0 14-9.5 23t-22.5 9H80q-14 0-23-9t-9-23V192h32v256h384V64H336V32h128zm-314 92q-6 6-11 0L44 37q-5-5-11.5-5T21 37t-5 11.5T21 60l101 92q9 9 22 9t23-9l99-92q5-5 5-11t-5-11q-12-12-23 0z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var collapse = { pathData, accData };

	return collapse;

});
