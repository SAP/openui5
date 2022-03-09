sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/play', './v4/play'], function (Theme, play$2, play$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? play$1 : play$2;
	var play = { pathData };

	return play;

});
