sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/filter', './v4/filter'], function (Theme, filter$2, filter$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? filter$1 : filter$2;
	var filter = { pathData };

	return filter;

});
