sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/media-pause', './v4/media-pause'], function (Theme, mediaPause$2, mediaPause$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? mediaPause$1 : mediaPause$2;
	var mediaPause = { pathData };

	return mediaPause;

});
