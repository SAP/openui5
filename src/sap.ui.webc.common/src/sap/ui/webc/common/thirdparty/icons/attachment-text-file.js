sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-text-file', './v4/attachment-text-file'], function (Theme, attachmentTextFile$2, attachmentTextFile$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentTextFile$1 : attachmentTextFile$2;
	var attachmentTextFile = { pathData };

	return attachmentTextFile;

});
