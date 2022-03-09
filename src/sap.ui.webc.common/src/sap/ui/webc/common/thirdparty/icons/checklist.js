sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist', './v4/checklist'], function (Theme, checklist$2, checklist$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklist$1 : checklist$2;
	var checklist = { pathData };

	return checklist;

});
