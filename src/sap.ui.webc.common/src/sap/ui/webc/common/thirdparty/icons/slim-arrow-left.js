sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/slim-arrow-left', './v4/slim-arrow-left'], function (Theme, slimArrowLeft$2, slimArrowLeft$1) { 'use strict';

	const pathData = Theme.isTheme("sap_horizon") ? slimArrowLeft$1 : slimArrowLeft$2;
	var slimArrowLeft = { pathData };

	return slimArrowLeft;

});
