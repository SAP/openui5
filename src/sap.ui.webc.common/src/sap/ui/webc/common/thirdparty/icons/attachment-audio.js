sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-audio', './v4/attachment-audio'], function (Theme, attachmentAudio$2, attachmentAudio$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentAudio$1 : attachmentAudio$2;
	var attachmentAudio = { pathData };

	return attachmentAudio;

});
