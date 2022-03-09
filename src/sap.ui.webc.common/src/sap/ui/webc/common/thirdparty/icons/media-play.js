sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-play', './v4/media-play'], function (Theme, mediaPlay$2, mediaPlay$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaPlay$1 : mediaPlay$2;
	var mediaPlay = { pathData };

	return mediaPlay;

});
