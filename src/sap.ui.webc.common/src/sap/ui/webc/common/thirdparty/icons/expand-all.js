sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/expand-all', './v4/expand-all'], function (Theme, expandAll$2, expandAll$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? expandAll$1 : expandAll$2;
	var expandAll = { pathData };

	return expandAll;

});
