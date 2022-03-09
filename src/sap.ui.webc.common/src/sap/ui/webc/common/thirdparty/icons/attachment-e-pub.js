sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/attachment-e-pub', './v4/attachment-e-pub'], function (Theme, attachmentEPub$2, attachmentEPub$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? attachmentEPub$1 : attachmentEPub$2;
	var attachmentEPub = { pathData };

	return attachmentEPub;

});
