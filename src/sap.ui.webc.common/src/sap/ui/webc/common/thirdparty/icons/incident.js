sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/incident', './v4/incident'], function (exports, Theme, incident$1, incident$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? incident$1.pathData : incident$2.pathData;
	var incident = "incident";

	exports.accData = incident$1.accData;
	exports.ltr = incident$1.ltr;
	exports.default = incident;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
