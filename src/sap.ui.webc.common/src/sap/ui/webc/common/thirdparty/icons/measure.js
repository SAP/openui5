sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/measure', './v4/measure'], function (Theme, measure$2, measure$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? measure$1 : measure$2;
	var measure = { pathData };

	return measure;

});
