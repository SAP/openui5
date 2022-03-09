sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/document-text', './v4/document-text'], function (Theme, documentText$2, documentText$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? documentText$1 : documentText$2;
	var documentText = { pathData };

	return documentText;

});
