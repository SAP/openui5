sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/drop-down-list', './v4/drop-down-list'], function (Theme, dropDownList$2, dropDownList$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? dropDownList$1 : dropDownList$2;
	var dropDownList = { pathData };

	return dropDownList;

});
