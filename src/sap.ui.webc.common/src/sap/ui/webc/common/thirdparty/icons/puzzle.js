sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/puzzle', './v4/puzzle'], function (Theme, puzzle$2, puzzle$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? puzzle$1 : puzzle$2;
	var puzzle = { pathData };

	return puzzle;

});
