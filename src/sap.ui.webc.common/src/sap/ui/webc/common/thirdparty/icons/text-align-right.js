sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-right', './v4/text-align-right'], function (Theme, textAlignRight$2, textAlignRight$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignRight$1 : textAlignRight$2;
	var textAlignRight = { pathData };

	return textAlignRight;

});
