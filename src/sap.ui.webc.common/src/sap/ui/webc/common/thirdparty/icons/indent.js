sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/indent', './v4/indent'], function (Theme, indent$2, indent$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? indent$1 : indent$2;
	var indent = { pathData };

	return indent;

});
