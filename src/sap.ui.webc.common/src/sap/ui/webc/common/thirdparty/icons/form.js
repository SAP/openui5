sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/form', './v4/form'], function (exports, Theme, form$1, form$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? form$1.pathData : form$2.pathData;
	var form = "form";

	exports.accData = form$1.accData;
	exports.ltr = form$1.ltr;
	exports.default = form;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
