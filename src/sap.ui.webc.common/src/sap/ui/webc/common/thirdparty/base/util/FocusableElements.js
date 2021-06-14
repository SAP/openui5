sap.ui.define(['exports', './isNodeHidden', './isNodeClickable'], function (exports, isNodeHidden, isNodeClickable) { 'use strict';

	const isFocusTrap = el => {
		return el.hasAttribute("data-ui5-focus-trap");
	};
	const getFirstFocusableElement = async container => {
		if (!container || isNodeHidden(container)) {
			return null;
		}
		return findFocusableElement(container, true);
	};
	const getLastFocusableElement = async container => {
		if (!container || isNodeHidden(container)) {
			return null;
		}
		return findFocusableElement(container, false);
	};
	const isElemFocusable = el => {
		return el.hasAttribute("data-ui5-focus-redirect") || !isNodeHidden(el);
	};
	const findFocusableElement = async (container, forward) => {
		let child;
		if (container.shadowRoot) {
			child = forward ? container.shadowRoot.firstChild : container.shadowRoot.lastChild;
		} else if (container.assignedNodes && container.assignedNodes()) {
			const assignedElements = container.assignedNodes();
			child = forward ? assignedElements[0] : assignedElements[assignedElements.length - 1];
		} else {
			child = forward ? container.firstChild : container.lastChild;
		}
		let focusableDescendant;
		while (child) {
			const originalChild = child;
			if (child.isUI5Element) {
				child = await child.getFocusDomRefAsync();
			}
			if (!child) {
				return null;
			}
			if (child.nodeType === 1 && isElemFocusable(child) && !isFocusTrap(child)) {
				if (isNodeClickable(child)) {
					return (child && typeof child.focus === "function") ? child : null;
				}
				focusableDescendant = await findFocusableElement(child, forward);
				if (focusableDescendant) {
					return (focusableDescendant && typeof focusableDescendant.focus === "function") ? focusableDescendant : null;
				}
			}
			child = forward ? originalChild.nextSibling : originalChild.previousSibling;
		}
		return null;
	};

	exports.getFirstFocusableElement = getFirstFocusableElement;
	exports.getLastFocusableElement = getLastFocusableElement;

	Object.defineProperty(exports, '__esModule', { value: true });

});
