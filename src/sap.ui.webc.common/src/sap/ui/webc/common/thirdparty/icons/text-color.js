sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-color', './v4/text-color'], function (Theme, textColor$2, textColor$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? textColor$1 : textColor$2;
	var textColor = { pathData };

	return textColor;

});
