sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-zip-file', './v4/attachment-zip-file'], function (Theme, attachmentZipFile$2, attachmentZipFile$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentZipFile$1 : attachmentZipFile$2;
	var attachmentZipFile = { pathData };

	return attachmentZipFile;

});
