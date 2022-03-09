sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/zoom-out', './v4/zoom-out'], function (Theme, zoomOut$2, zoomOut$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? zoomOut$1 : zoomOut$2;
	var zoomOut = { pathData };

	return zoomOut;

});
