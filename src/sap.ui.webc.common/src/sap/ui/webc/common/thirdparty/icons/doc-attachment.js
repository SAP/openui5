sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/doc-attachment', './v4/doc-attachment'], function (Theme, docAttachment$2, docAttachment$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? docAttachment$1 : docAttachment$2;
	var docAttachment = { pathData };

	return docAttachment;

});
