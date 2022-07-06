sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "add";
	const pathData = "M286 279v164q0 11-7.5 18.5T260 469q-10 0-18-8-8-6-8-18V279H70q-12 0-18-8-8-8-8-18 0-11 7.5-18.5T70 227h164V63q0-11 7.5-18.5T260 37t18.5 7.5T286 63v164h164q11 0 18.5 7.5T476 253t-7.5 18.5T450 279H286z";
	const ltr = false;
	const accData = i18nDefaults.ICON_ADD;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var add = "add";

	exports.accData = accData;
	exports.default = add;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
