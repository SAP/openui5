sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist-2', './v4/checklist-2'], function (Theme, checklist2$2, checklist2$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklist2$1 : checklist2$2;
	var checklist2 = { pathData };

	return checklist2;

});
