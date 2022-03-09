sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/ppt-attachment', './v4/ppt-attachment'], function (Theme, pptAttachment$2, pptAttachment$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? pptAttachment$1 : pptAttachment$2;
	var pptAttachment = { pathData };

	return pptAttachment;

});
