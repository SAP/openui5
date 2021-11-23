sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/numbered-text', './v4/numbered-text'], function (Theme, numberedText$2, numberedText$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? numberedText$1 : numberedText$2;
	var numberedText = { pathData };

	return numberedText;

});
