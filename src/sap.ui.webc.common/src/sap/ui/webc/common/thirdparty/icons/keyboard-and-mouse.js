sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/keyboard-and-mouse', './v4/keyboard-and-mouse'], function (Theme, keyboardAndMouse$2, keyboardAndMouse$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? keyboardAndMouse$1 : keyboardAndMouse$2;
	var keyboardAndMouse = { pathData };

	return keyboardAndMouse;

});
