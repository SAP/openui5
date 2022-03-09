sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/edit', './v4/edit'], function (Theme, edit$2, edit$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? edit$1 : edit$2;
	var edit = { pathData };

	return edit;

});
