sap.ui.define(['sap/ui/webc/common/thirdparty/base/asset-registries/Icons', './generated/i18n/i18n-defaults'], function (Icons, i18nDefaults) { 'use strict';

	const name = "resize";
	const pathData = "M0 338q0-17 16-18 6 1 11 5.5t5 11.5v120q1-1 1.5-2t2.5-3L459 32H336q-14 0-16-14 0-17 16-18h144q14 0 23 9.5t9 23.5v143q0 17-16 18-6-1-11-5.5t-5-11.5V57L55 480h121q14 0 16 14 0 17-16 18H32q-14 0-23-9.5T0 479V338zm288 110h160V288h32v160q0 13-9 22.5t-23 9.5H288v-32zM64 32h160v32H64v160H32V64q0-14 9.5-23T64 32z";
	const ltr = false;
	const accData = i18nDefaults.ICON_RESIZE;
	const collection = "SAP-icons";
	const packageName = "@ui5/webcomponents-icons";
	Icons.registerIcon(name, { pathData, ltr, accData, collection, packageName });
	var resize = { pathData, accData };

	return resize;

});
