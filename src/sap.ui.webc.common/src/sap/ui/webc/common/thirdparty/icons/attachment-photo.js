sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-photo', './v4/attachment-photo'], function (Theme, attachmentPhoto$2, attachmentPhoto$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentPhoto$1 : attachmentPhoto$2;
	var attachmentPhoto = { pathData };

	return attachmentPhoto;

});
