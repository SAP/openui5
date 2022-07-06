sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/technical-object', './v4/technical-object'], function (exports, Theme, technicalObject$1, technicalObject$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? technicalObject$1.pathData : technicalObject$2.pathData;
	var technicalObject = "technical-object";

	exports.accData = technicalObject$1.accData;
	exports.ltr = technicalObject$1.ltr;
	exports.default = technicalObject;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
