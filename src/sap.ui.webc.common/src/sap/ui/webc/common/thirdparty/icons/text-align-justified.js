sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-justified', './v4/text-align-justified'], function (Theme, textAlignJustified$2, textAlignJustified$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? textAlignJustified$1 : textAlignJustified$2;
	var textAlignJustified = { pathData };

	return textAlignJustified;

});
