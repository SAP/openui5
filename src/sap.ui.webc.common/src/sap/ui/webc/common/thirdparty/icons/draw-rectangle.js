sap.ui.define(['sap/ui/webc/common/thirdparty/base/config/Theme', './v5/draw-rectangle', './v4/draw-rectangle'], function (Theme, drawRectangle$2, drawRectangle$1) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? drawRectangle$1 : drawRectangle$2;
	var drawRectangle = { pathData };

	return drawRectangle;

});
