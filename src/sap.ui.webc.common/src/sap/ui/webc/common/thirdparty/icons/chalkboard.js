sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/chalkboard', './v4/chalkboard'], function (Theme, chalkboard$2, chalkboard$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? chalkboard$1 : chalkboard$2;
	var chalkboard = { pathData };

	return chalkboard;

});
