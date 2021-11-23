sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/blank-tag', './v4/blank-tag'], function (Theme, blankTag$2, blankTag$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? blankTag$1 : blankTag$2;
	var blankTag = { pathData };

	return blankTag;

});
