sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/create-form', './v4/create-form'], function (exports, Theme, createForm$1, createForm$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? createForm$1.pathData : createForm$2.pathData;
	var createForm = "create-form";

	exports.accData = createForm$1.accData;
	exports.ltr = createForm$1.ltr;
	exports.default = createForm;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
