sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/checklist-item', './v4/checklist-item'], function (Theme, checklistItem$2, checklistItem$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? checklistItem$1 : checklistItem$2;
	var checklistItem = { pathData };

	return checklistItem;

});
