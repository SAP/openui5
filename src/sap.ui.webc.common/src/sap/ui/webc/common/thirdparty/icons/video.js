sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/video', './v4/video'], function (Theme, video$2, video$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? video$1 : video$2;
	var video = { pathData };

	return video;

});
