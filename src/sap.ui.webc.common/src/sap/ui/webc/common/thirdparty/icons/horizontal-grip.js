sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/horizontal-grip', './v4/horizontal-grip'], function (Theme, horizontalGrip$2, horizontalGrip$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? horizontalGrip$1 : horizontalGrip$2;
	var horizontalGrip = { pathData };

	return horizontalGrip;

});
