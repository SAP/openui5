sap.ui.define(['exports'], function (exports) { 'use strict';

	const getSlotName = node => {
		if (!(node instanceof HTMLElement)) {
			return "default";
		}
		const slot = node.getAttribute("slot");
		if (slot) {
			const match = slot.match(/^(.+?)-\d+$/);
			return match ? match[1] : slot;
		}
		return "default";
	};
	const isSlot = el => el && el instanceof HTMLElement && el.localName === "slot";
	const getSlottedElements = el => {
		if (isSlot(el)) {
			return el.assignedNodes({ flatten: true }).filter(item => item instanceof HTMLElement);
		}
		return [el];
	};
	const getSlottedElementsList = elList => {
		const reducer = (acc, curr) => acc.concat(getSlottedElements(curr));
		return elList.reduce(reducer, []);
	};

	exports.getSlotName = getSlotName;
	exports.getSlottedElements = getSlottedElements;
	exports.getSlottedElementsList = getSlottedElementsList;
	exports.isSlot = isSlot;

	Object.defineProperty(exports, '__esModule', { value: true });

});
