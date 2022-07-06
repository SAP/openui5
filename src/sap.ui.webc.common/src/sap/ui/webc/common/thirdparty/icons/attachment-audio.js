sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-audio', './v4/attachment-audio'], function (exports, Theme, attachmentAudio$1, attachmentAudio$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentAudio$1.pathData : attachmentAudio$2.pathData;
	var attachmentAudio = "attachment-audio";

	exports.accData = attachmentAudio$1.accData;
	exports.ltr = attachmentAudio$1.ltr;
	exports.default = attachmentAudio;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
