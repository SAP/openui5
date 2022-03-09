sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/goal', './v4/goal'], function (Theme, goal$2, goal$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? goal$1 : goal$2;
	var goal = { pathData };

	return goal;

});
