sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pdf-attachment', './v4/pdf-attachment'], function (Theme, pdfAttachment$2, pdfAttachment$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pdfAttachment$1 : pdfAttachment$2;
	var pdfAttachment = { pathData };

	return pdfAttachment;

});
