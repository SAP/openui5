sap.ui.define(['exports', './findNodeOwner'], function (exports, findNodeOwner) { 'use strict';

	const getEffectiveAriaLabelText = el => {
		if (!el.accessibleNameRef) {
			if (el.accessibleName) {
				return el.accessibleName;
			}
			return undefined;
		}
		return getAriaLabelledByTexts(el);
	};
	const getAriaLabelledByTexts = (el, ownerDocument, readyIds = "") => {
		const ids = (readyIds && readyIds.split(" ")) || el.accessibleNameRef.split(" ");
		const owner = ownerDocument || findNodeOwner(el);
		let result = "";
		ids.forEach((elementId, index) => {
			const element = owner.querySelector(`[id='${elementId}']`);
			result += `${element ? element.textContent : ""}`;
			if (index < ids.length - 1) {
				result += " ";
			}
		});
		return result;
	};

	exports.getAriaLabelledByTexts = getAriaLabelledByTexts;
	exports.getEffectiveAriaLabelText = getEffectiveAriaLabelText;

	Object.defineProperty(exports, '__esModule', { value: true });

});
