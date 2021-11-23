sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/inspection', './v4/inspection'], function (Theme, inspection$2, inspection$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? inspection$1 : inspection$2;
	var inspection = { pathData };

	return inspection;

});
