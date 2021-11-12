sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/collapse-group', './v4/collapse-group'], function (Theme, collapseGroup$2, collapseGroup$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? collapseGroup$1 : collapseGroup$2;
	var collapseGroup = { pathData };

	return collapseGroup;

});
