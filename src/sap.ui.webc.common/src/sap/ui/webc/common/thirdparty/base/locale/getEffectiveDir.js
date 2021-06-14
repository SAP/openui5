sap.ui.define(['../config/RTL'], function (RTL) { 'use strict';

	const GLOBAL_DIR_CSS_VAR = "--_ui5_dir";
	const getEffectiveDir = element => {
		const doc = window.document;
		const dirValues = ["ltr", "rtl"];
		const locallyAppliedDir = getComputedStyle(element).getPropertyValue(GLOBAL_DIR_CSS_VAR);
		if (dirValues.includes(locallyAppliedDir)) {
			return locallyAppliedDir;
		}
		if (dirValues.includes(element.dir)) {
			return element.dir;
		}
		if (dirValues.includes(doc.documentElement.dir)) {
			return doc.documentElement.dir;
		}
		if (dirValues.includes(doc.body.dir)) {
			return doc.body.dir;
		}
		return RTL.getRTL() ? "rtl" : undefined;
	};

	return getEffectiveDir;

});
