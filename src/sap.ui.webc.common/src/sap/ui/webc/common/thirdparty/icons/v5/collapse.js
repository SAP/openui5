sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "collapse";
	const pathData = "M360.5 9q9-9 22-9 12 0 21 9 10 9 10 22 0 12-10 21l-124 124q-10 10-21 10-12 0-22-10l-124-124q-9-9-9-21 0-13 9-22t22-9q12 0 21 9l103 102zm-205 493q-9 10-21 10-13 0-22-10-9-9-9-21 0-13 9-22l124-124q9-9 22-9 12 0 21 9l124 124q10 9 10 22 0 12-10 21-9 10-21 10-13 0-22-10l-102-102z";
	const ltr = false;
	const accData = i18nDefaults.ICON_COLLAPSE;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var collapse = "collapse";

	exports.accData = accData;
	exports.default = collapse;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
