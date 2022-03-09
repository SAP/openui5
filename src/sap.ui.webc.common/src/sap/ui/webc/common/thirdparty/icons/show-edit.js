sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/show-edit', './v4/show-edit'], function (Theme, showEdit$2, showEdit$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? showEdit$1 : showEdit$2;
	var showEdit = { pathData };

	return showEdit;

});
