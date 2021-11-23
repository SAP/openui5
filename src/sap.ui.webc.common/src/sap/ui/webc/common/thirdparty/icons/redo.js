sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/redo', './v4/redo'], function (Theme, redo$2, redo$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? redo$1 : redo$2;
	var redo = { pathData };

	return redo;

});
