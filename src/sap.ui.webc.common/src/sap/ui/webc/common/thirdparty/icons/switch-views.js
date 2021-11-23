sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/switch-views', './v4/switch-views'], function (Theme, switchViews$2, switchViews$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? switchViews$1 : switchViews$2;
	var switchViews = { pathData };

	return switchViews;

});
