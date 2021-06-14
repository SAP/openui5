sap.ui.define(function () { 'use strict';

	const findNodeOwner = node => {
		if (!(node instanceof HTMLElement)) {
			throw new Error("Argument node should be of type HTMLElement");
		}
		const ownerTypes = [HTMLHtmlElement, HTMLIFrameElement];
		let currentShadowRootFlag = true;
		let currentCustomElementFlag = true;
		while (node) {
			if (node.toString() === "[object ShadowRoot]") {
				if (currentShadowRootFlag) {
					currentShadowRootFlag = false;
				}
				if (!currentCustomElementFlag && !currentShadowRootFlag) {
					return node;
				}
			} else if (node.tagName && node.tagName.indexOf("-") > -1) {
				if (currentCustomElementFlag) {
					currentCustomElementFlag = false;
				} else {
					return node;
				}
			} else if (ownerTypes.indexOf(node.constructor) > -1) {
				return node;
			}
			node = node.parentNode || node.host;
		}
	};

	return findNodeOwner;

});
