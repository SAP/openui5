sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "collapse";
	const pathData = "M464 32q13 0 22.5 9.5T496 64v384q0 14-9.5 23t-22.5 9H80q-14 0-23-9t-9-23V192h32v256h384V64H336V32h128zm-314 92l93-86q6-6 11-6 6 0 12 6 5 5 5 11t-5 11l-99 92q-10 9-23 9t-22-9L21 60q-5-5-5-11.5T21 37t11.5-5T44 37l95 87q3 3 5 3 3 0 6-3zm-6 116h256v32H144v-32z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var collapse = "collapse";

	exports.accData = accData;
	exports.default = collapse;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
