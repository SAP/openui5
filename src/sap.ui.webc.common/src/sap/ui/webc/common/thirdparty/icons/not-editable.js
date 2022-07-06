sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/not-editable', './v4/not-editable'], function (exports, Theme, notEditable$1, notEditable$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? notEditable$1.pathData : notEditable$2.pathData;
	var notEditable = "not-editable";

	exports.accData = notEditable$1.accData;
	exports.ltr = notEditable$1.ltr;
	exports.default = notEditable;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
