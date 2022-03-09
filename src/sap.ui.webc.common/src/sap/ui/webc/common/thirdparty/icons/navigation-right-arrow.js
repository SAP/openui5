sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/navigation-right-arrow', './v4/navigation-right-arrow'], function (Theme, navigationRightArrow$2, navigationRightArrow$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? navigationRightArrow$1 : navigationRightArrow$2;
	var navigationRightArrow = { pathData };

	return navigationRightArrow;

});
