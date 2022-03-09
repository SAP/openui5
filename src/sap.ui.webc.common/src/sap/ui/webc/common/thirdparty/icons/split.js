sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/split', './v4/split'], function (Theme, split$2, split$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? split$1 : split$2;
	var split = { pathData };

	return split;

});
