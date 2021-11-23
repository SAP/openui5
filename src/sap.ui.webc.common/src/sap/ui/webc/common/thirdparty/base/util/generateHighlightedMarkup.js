sap.ui.define(['./escapeRegex', 'sap/base/security/encodeXML'], function (escapeRegex, encodeXML) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e['default'] : e; }

	var encodeXML__default = /*#__PURE__*/_interopDefaultLegacy(encodeXML);

	function replaceAll(text, find, replace, caseInsensitive) {
		return text.replace(new RegExp(escapeRegex(find), `${caseInsensitive ? "i" : ""}g`), replace);
	}
	function generateHighlightedMarkup(text, textToHighlight) {
		if (!text || !textToHighlight) {
			return text;
		}
		const makeToken = t => {
			const [s, e] = t.split("");
			while (text.indexOf(t) >= 0 || textToHighlight.indexOf(t) >= 0) {
				t = `${s}${t}${e}`;
			}
			return t;
		};
		const openToken = makeToken("12");
		const closeToken = makeToken("34");
		let result = encodeXML__default(replaceAll(text, textToHighlight, match => `${openToken}${match}${closeToken}`, true));
		[[openToken, "<b>"], [closeToken, "</b>"]].forEach(([find, replace]) => {
			result = replaceAll(result, find, replace);
		});
		return result;
	}

	return generateHighlightedMarkup;

});
