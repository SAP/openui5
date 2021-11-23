sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/zoom-in', './v4/zoom-in'], function (Theme, zoomIn$2, zoomIn$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? zoomIn$1 : zoomIn$2;
	var zoomIn = { pathData };

	return zoomIn;

});
