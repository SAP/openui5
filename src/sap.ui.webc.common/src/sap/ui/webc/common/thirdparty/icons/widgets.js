sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/widgets', './v4/widgets'], function (Theme, widgets$2, widgets$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? widgets$1 : widgets$2;
	var widgets = { pathData };

	return widgets;

});
