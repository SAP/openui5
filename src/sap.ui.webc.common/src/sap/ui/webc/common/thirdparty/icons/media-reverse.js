sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-reverse', './v4/media-reverse'], function (Theme, mediaReverse$2, mediaReverse$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mediaReverse$1 : mediaReverse$2;
	var mediaReverse = { pathData };

	return mediaReverse;

});
