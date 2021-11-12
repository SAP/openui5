sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/positive', './v4/positive'], function (Theme, positive$2, positive$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? positive$1 : positive$2;
	var positive = { pathData };

	return positive;

});
