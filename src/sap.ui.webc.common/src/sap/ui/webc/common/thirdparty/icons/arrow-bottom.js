sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/arrow-bottom', './v4/arrow-bottom'], function (Theme, arrowBottom$2, arrowBottom$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? arrowBottom$1 : arrowBottom$2;
	var arrowBottom = { pathData };

	return arrowBottom;

});
