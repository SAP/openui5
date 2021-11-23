sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-rewind', './v4/media-rewind'], function (Theme, mediaRewind$2, mediaRewind$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mediaRewind$1 : mediaRewind$2;
	var mediaRewind = { pathData };

	return mediaRewind;

});
