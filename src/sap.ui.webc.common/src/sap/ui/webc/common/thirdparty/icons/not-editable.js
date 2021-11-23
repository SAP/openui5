sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/not-editable', './v4/not-editable'], function (Theme, notEditable$2, notEditable$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? notEditable$1 : notEditable$2;
	var notEditable = { pathData };

	return notEditable;

});
