sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/to-be-reviewed', './v4/to-be-reviewed'], function (Theme, toBeReviewed$2, toBeReviewed$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? toBeReviewed$1 : toBeReviewed$2;
	var toBeReviewed = { pathData };

	return toBeReviewed;

});
