sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/syntax', './v4/syntax'], function (Theme, syntax$2, syntax$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? syntax$1 : syntax$2;
	var syntax = { pathData };

	return syntax;

});
