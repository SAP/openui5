sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "zoom-in";
	const pathData = "M313.5 199q13 0 20.5 8t7.5 21q0 28-28 28h-57v57q0 28-29 28-28 0-28-28v-57h-57q-28 0-28-28 0-13 7.5-21t20.5-8h57v-56q0-13 7.5-21t20.5-8q14 0 21.5 8t7.5 21v56h57zm190 264q8 9 8 20.5t-8 19.5q-8 9-20 9t-20-9l-96-96q-62 48-140 48-46 0-87.5-18t-72.5-48.5-49-72T.5 228t18-88.5 49-72T140 19t87.5-18q47 0 88.5 18t72.5 48.5 49 72 18 88.5q0 78-49 139zm-446-235q0 35 13.5 66t36.5 54 54 36.5 66 13.5 66.5-13.5 54.5-36.5 36.5-54 13.5-66-13.5-66.5-36.5-54.5T294 70.5 227.5 57t-66 13.5-54 36.5T71 161.5 57.5 228z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ZOOM_IN;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var zoomIn = "zoom-in";

	exports.accData = accData;
	exports.default = zoomIn;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
