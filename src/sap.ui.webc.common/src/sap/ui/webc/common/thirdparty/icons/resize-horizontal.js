sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/resize-horizontal', './v4/resize-horizontal'], function (Theme, resizeHorizontal$2, resizeHorizontal$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? resizeHorizontal$1 : resizeHorizontal$2;
	var resizeHorizontal = { pathData };

	return resizeHorizontal;

});
