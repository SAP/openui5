sap.ui.define(function () { 'use strict';

	const rCSS = /[\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\xff\u2028\u2029][0-9A-Fa-f]?/g;
	const toHex = (iChar, iLength) => {
		let sHex = iChar.toString(16);
		if (iLength) {
			sHex = sHex.padStart(iLength, "0");
		}
		return sHex;
	};
	const fnCSS = sChar => {
		const iChar = sChar.charCodeAt(0);
		if (sChar.length === 1) {
			return `\\${toHex(iChar)}`;
		}
		return `\\${toHex(iChar)} ${sChar.substr(1)}`;
	};
	const encodeCSS = string => {
		return string.replace(rCSS, fnCSS);
	};

	return encodeCSS;

});
