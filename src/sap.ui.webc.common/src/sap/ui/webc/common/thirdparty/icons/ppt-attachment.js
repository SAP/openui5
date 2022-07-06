sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ppt-attachment', './v4/ppt-attachment'], function (exports, Theme, pptAttachment$1, pptAttachment$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pptAttachment$1.pathData : pptAttachment$2.pathData;
	var pptAttachment = "ppt-attachment";

	exports.accData = pptAttachment$1.accData;
	exports.ltr = pptAttachment$1.ltr;
	exports.default = pptAttachment;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
