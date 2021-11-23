sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-left-arrow', './v4/navigation-left-arrow'], function (Theme, navigationLeftArrow$2, navigationLeftArrow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? navigationLeftArrow$1 : navigationLeftArrow$2;
	var navigationLeftArrow = { pathData };

	return navigationLeftArrow;

});
