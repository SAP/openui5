sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/vertical-grip', './v4/vertical-grip'], function (Theme, verticalGrip$2, verticalGrip$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? verticalGrip$1 : verticalGrip$2;
	var verticalGrip = { pathData };

	return verticalGrip;

});
