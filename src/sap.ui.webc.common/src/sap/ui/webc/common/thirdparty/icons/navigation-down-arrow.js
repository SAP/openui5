sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-down-arrow', './v4/navigation-down-arrow'], function (Theme, navigationDownArrow$2, navigationDownArrow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? navigationDownArrow$1 : navigationDownArrow$2;
	var navigationDownArrow = { pathData };

	return navigationDownArrow;

});
