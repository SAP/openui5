sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/underline-text', './v4/underline-text'], function (Theme, underlineText$2, underlineText$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? underlineText$1 : underlineText$2;
	var underlineText = { pathData };

	return underlineText;

});
