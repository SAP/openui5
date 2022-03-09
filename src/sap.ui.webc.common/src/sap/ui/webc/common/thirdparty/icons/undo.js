sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/undo', './v4/undo'], function (Theme, undo$2, undo$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? undo$1 : undo$2;
	var undo = { pathData };

	return undo;

});
