sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-formatting', './v4/text-formatting'], function (Theme, textFormatting$2, textFormatting$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? textFormatting$1 : textFormatting$2;
	var textFormatting = { pathData };

	return textFormatting;

});
