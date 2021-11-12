sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-video', './v4/attachment-video'], function (Theme, attachmentVideo$2, attachmentVideo$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? attachmentVideo$1 : attachmentVideo$2;
	var attachmentVideo = { pathData };

	return attachmentVideo;

});
