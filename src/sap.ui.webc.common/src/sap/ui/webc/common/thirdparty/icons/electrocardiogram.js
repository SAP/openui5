sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/electrocardiogram', './v4/electrocardiogram'], function (Theme, electrocardiogram$2, electrocardiogram$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? electrocardiogram$1 : electrocardiogram$2;
	var electrocardiogram = { pathData };

	return electrocardiogram;

});
