sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/edit-outside', './v4/edit-outside'], function (Theme, editOutside$2, editOutside$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? editOutside$1 : editOutside$2;
	var editOutside = { pathData };

	return editOutside;

});
