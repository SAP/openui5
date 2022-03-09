sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/sound-loud', './v4/sound-loud'], function (Theme, soundLoud$2, soundLoud$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? soundLoud$1 : soundLoud$2;
	var soundLoud = { pathData };

	return soundLoud;

});
