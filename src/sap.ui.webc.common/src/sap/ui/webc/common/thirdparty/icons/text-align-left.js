sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-left', './v4/text-align-left'], function (Theme, textAlignLeft$2, textAlignLeft$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? textAlignLeft$1 : textAlignLeft$2;
	var textAlignLeft = { pathData };

	return textAlignLeft;

});
