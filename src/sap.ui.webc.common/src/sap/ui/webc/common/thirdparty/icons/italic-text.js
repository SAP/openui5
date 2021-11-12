sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/italic-text', './v4/italic-text'], function (Theme, italicText$2, italicText$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? italicText$1 : italicText$2;
	var italicText = { pathData };

	return italicText;

});
