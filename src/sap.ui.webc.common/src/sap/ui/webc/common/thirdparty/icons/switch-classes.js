sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/switch-classes', './v4/switch-classes'], function (Theme, switchClasses$2, switchClasses$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? switchClasses$1 : switchClasses$2;
	var switchClasses = { pathData };

	return switchClasses;

});
