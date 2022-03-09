sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/hint', './v4/hint'], function (Theme, hint$2, hint$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? hint$1 : hint$2;
	var hint = { pathData };

	return hint;

});
