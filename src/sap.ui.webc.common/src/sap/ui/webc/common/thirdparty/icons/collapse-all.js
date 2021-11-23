sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse-all', './v4/collapse-all'], function (Theme, collapseAll$2, collapseAll$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collapseAll$1 : collapseAll$2;
	var collapseAll = { pathData };

	return collapseAll;

});
