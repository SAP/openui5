sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/multiselect-none', './v4/multiselect-none'], function (exports, Theme, multiselectNone$1, multiselectNone$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? multiselectNone$1.pathData : multiselectNone$2.pathData;
	var multiselectNone = "multiselect-none";

	exports.accData = multiselectNone$1.accData;
	exports.ltr = multiselectNone$1.ltr;
	exports.default = multiselectNone;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
