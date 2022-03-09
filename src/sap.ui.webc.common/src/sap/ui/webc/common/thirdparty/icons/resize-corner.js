sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-corner', './v4/resize-corner'], function (Theme, resizeCorner$2, resizeCorner$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? resizeCorner$1 : resizeCorner$2;
	var resizeCorner = { pathData };

	return resizeCorner;

});
