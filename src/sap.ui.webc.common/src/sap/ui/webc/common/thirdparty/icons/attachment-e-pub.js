sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-e-pub', './v4/attachment-e-pub'], function (exports, Theme, attachmentEPub$1, attachmentEPub$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentEPub$1.pathData : attachmentEPub$2.pathData;
	var attachmentEPub = "attachment-e-pub";

	exports.accData = attachmentEPub$1.accData;
	exports.ltr = attachmentEPub$1.ltr;
	exports.default = attachmentEPub;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
