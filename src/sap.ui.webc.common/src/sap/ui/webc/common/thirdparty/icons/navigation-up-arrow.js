sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-up-arrow', './v4/navigation-up-arrow'], function (Theme, navigationUpArrow$2, navigationUpArrow$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? navigationUpArrow$1 : navigationUpArrow$2;
	var navigationUpArrow = { pathData };

	return navigationUpArrow;

});
