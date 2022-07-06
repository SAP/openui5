sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "drill-up";
	const pathData = "M150 183q-9 10-22 10t-22-10q-10-9-10-22t10-22L233 11q10-10 22.5-10T278 11l128 128q10 9 10 22t-10 22q-10 10-22.5 10T361 183L256 78zm256 115q10 10 10 22.5T406 343t-22.5 10-22.5-10L256 238 150 343q-9 10-22 10t-22-10q-10-10-10-22.5t10-22.5l127-127q10-10 22.5-10t22.5 10zm0 160q10 10 10 22.5T406 503t-22.5 10-22.5-10L256 397 150 503q-9 10-22 10t-22-10q-10-10-10-22.5t10-22.5l127-128q10-9 22.5-9t22.5 9z";
	const ltr = false;
	const accData = i18nDefaults.ICON_DRILL_UP;
	const collection = "SAP-icons-v5";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var drillUp = "drill-up";

	exports.accData = accData;
	exports.default = drillUp;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
