sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/pdf-reader', './v4/pdf-reader'], function (Theme, pdfReader$2, pdfReader$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? pdfReader$1 : pdfReader$2;
	var pdfReader = { pathData };

	return pdfReader;

});
