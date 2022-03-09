sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/visits', './v4/visits'], function (Theme, visits$2, visits$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? visits$1 : visits$2;
	var visits = { pathData };

	return visits;

});
