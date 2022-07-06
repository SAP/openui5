sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "zoom-out";
	const pathData = "M313.5 199q13 0 20.5 8t7.5 21q0 28-28 28h-170q-29 0-29-28 0-13 7.5-21t21.5-8h170zm190 264q8 9 8 20.5t-8 19.5q-8 9-19.5 9t-20.5-9l-96-96q-62 48-139 48-47 0-88.5-18t-72-48.5-48.5-72-18-88.5 18-88.5 48.5-72T140 19t88.5-18T317 19t72 48.5 48.5 72 18 88.5q0 77-48 139zm-446-235q0 35 13.5 66t37 54 54.5 36.5 66 13.5 66-13.5 54-36.5 36.5-54 13.5-66-13.5-66-36.5-54-54-36.5-66-13.5-66 13.5T108 108t-37 54-13.5 66z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ZOOM_OUT;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var zoomOut = "zoom-out";

	exports.accData = accData;
	exports.default = zoomOut;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
