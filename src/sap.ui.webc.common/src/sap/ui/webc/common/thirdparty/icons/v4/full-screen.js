sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/asset-registries/Icons', '../generated/i18n/i18n-defaults'], function (exports, Icons, i18nDefaults) { 'use strict';

	const name = "full-screen";
	const pathData = "M326 166L452 32H336q-14 0-16-14 0-17 16-18h144q14 0 23 9.5t9 23.5v143q0 17-16 18-6-1-11-5.5t-5-11.5V57L350 189q-5 5-12 5-8 0-12-4-5-7-5-13t5-11zM64 32h192v32H64v192H32V64q0-14 9.5-23T64 32zm192 416h192V256h32v192q0 13-9 22.5t-23 9.5H256v-32zM0 338q0-17 16-18 6 1 11 5.5t5 11.5v118l130-132q5-5 12-5 8 0 12 4 6 6 6 12t-6 12L53 480h123q14 0 16 14 0 17-16 18H32q-14 0-23-9.5T0 479V338z";
	const ltr = false;
	const accData = i18nDefaults.ICON_FULL_SCREEN;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var fullScreen = "full-screen";

	exports.accData = accData;
	exports.default = fullScreen;
	exports.ltr = ltr;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
