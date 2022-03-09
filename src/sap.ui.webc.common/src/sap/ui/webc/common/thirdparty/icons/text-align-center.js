sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/text-align-center', './v4/text-align-center'], function (Theme, textAlignCenter$2, textAlignCenter$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? textAlignCenter$1 : textAlignCenter$2;
	var textAlignCenter = { pathData };

	return textAlignCenter;

});
