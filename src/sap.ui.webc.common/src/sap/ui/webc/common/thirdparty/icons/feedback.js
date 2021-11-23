sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/feedback', './v4/feedback'], function (Theme, feedback$2, feedback$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? feedback$1 : feedback$2;
	var feedback = { pathData };

	return feedback;

});
