sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-forward', './v4/media-forward'], function (Theme, mediaForward$2, mediaForward$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? mediaForward$1 : mediaForward$2;
	var mediaForward = { pathData };

	return mediaForward;

});
