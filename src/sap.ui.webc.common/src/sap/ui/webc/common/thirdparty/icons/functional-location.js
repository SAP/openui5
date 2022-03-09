sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/functional-location', './v4/functional-location'], function (Theme, functionalLocation$2, functionalLocation$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? functionalLocation$1 : functionalLocation$2;
	var functionalLocation = { pathData };

	return functionalLocation;

});
