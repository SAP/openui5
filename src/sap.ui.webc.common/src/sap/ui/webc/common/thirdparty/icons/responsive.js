sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/responsive', './v4/responsive'], function (Theme, responsive$2, responsive$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? responsive$1 : responsive$2;
	var responsive = { pathData };

	return responsive;

});
