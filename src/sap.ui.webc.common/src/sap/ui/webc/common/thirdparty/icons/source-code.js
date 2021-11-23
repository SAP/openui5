sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/source-code', './v4/source-code'], function (Theme, sourceCode$2, sourceCode$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? sourceCode$1 : sourceCode$2;
	var sourceCode = { pathData };

	return sourceCode;

});
