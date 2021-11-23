sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/color-fill', './v4/color-fill'], function (Theme, colorFill$2, colorFill$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? colorFill$1 : colorFill$2;
	var colorFill = { pathData };

	return colorFill;

});
