sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/present', './v4/present'], function (Theme, present$2, present$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? present$1 : present$2;
	var present = { pathData };

	return present;

});
