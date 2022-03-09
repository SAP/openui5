sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/thumb-up', './v4/thumb-up'], function (Theme, thumbUp$2, thumbUp$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? thumbUp$1 : thumbUp$2;
	var thumbUp = { pathData };

	return thumbUp;

});
