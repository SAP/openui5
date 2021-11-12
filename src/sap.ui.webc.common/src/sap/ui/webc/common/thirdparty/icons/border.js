sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/border', './v4/border'], function (Theme, border$2, border$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? border$1 : border$2;
	var border = { pathData };

	return border;

});
