sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/tree', './v4/tree'], function (Theme, tree$2, tree$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? tree$1 : tree$2;
	var tree = { pathData };

	return tree;

});
