sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/display-more', './v4/display-more'], function (Theme, displayMore$2, displayMore$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? displayMore$1 : displayMore$2;
	var displayMore = { pathData };

	return displayMore;

});
