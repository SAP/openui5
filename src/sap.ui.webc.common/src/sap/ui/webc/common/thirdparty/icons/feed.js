sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feed', './v4/feed'], function (Theme, feed$2, feed$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? feed$1 : feed$2;
	var feed = { pathData };

	return feed;

});
