sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/circle-task', './v4/circle-task'], function (Theme, circleTask$2, circleTask$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? circleTask$1 : circleTask$2;
	var circleTask = { pathData };

	return circleTask;

});
