sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/unlocked', './v4/unlocked'], function (Theme, unlocked$2, unlocked$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? unlocked$1 : unlocked$2;
	var unlocked = { pathData };

	return unlocked;

});
