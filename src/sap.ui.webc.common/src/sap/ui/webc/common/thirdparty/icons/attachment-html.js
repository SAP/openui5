sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-html', './v4/attachment-html'], function (Theme, attachmentHtml$2, attachmentHtml$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? attachmentHtml$1 : attachmentHtml$2;
	var attachmentHtml = { pathData };

	return attachmentHtml;

});
