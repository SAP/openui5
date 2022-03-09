sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/microphone', './v4/microphone'], function (Theme, microphone$2, microphone$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? microphone$1 : microphone$2;
	var microphone = { pathData };

	return microphone;

});
