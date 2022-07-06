sap.ui.define(['exports', 'sap/ui/webc/common/thirdparty/base/config/Theme', './v5/address-book', './v4/address-book'], function (exports, Theme, addressBook$1, addressBook$2) { 'use strict';

	const pathData = Theme.isThemeFamily("sap_horizon") ? addressBook$1.pathData : addressBook$2.pathData;
	var addressBook = "address-book";

	exports.accData = addressBook$1.accData;
	exports.ltr = addressBook$1.ltr;
	exports.default = addressBook;
	exports.pathData = pathData;

	Object.defineProperty(exports, '__esModule', { value: true });

});
