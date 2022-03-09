sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/image-viewer', './v4/image-viewer'], function (Theme, imageViewer$2, imageViewer$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? imageViewer$1 : imageViewer$2;
	var imageViewer = { pathData };

	return imageViewer;

});
