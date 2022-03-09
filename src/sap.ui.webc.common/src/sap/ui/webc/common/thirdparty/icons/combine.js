sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/combine', './v4/combine'], function (Theme, combine$2, combine$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? combine$1 : combine$2;
	var combine = { pathData };

	return combine;

});
