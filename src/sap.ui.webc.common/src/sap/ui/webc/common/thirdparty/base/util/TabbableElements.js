sap.ui.define(['exports', './isNodeTabbable'], function (exports, isNodeTabbable) { 'use strict';

	const getTabbableElements = node => {
		return getTabbables(node.children);
	};
	const getLastTabbableElement = node => {
		const tabbables = getTabbables(node.children);
		return tabbables.length ? tabbables[tabbables.length - 1] : null;
	};
	const getTabbables = (nodes, tabbables) => {
		const tabbablesNodes = tabbables || [];
		if (!nodes) {
			return tabbablesNodes;
		}
		Array.from(nodes).forEach(currentNode => {
			if (currentNode.nodeType === Node.TEXT_NODE || currentNode.nodeType === Node.COMMENT_NODE || currentNode.hasAttribute("data-sap-no-tab-ref")) {
				return;
			}
			if (currentNode.shadowRoot) {
				const children = currentNode.shadowRoot.children;
				currentNode = Array.from(children).find(node => node.tagName !== "STYLE");
			}
			if (isNodeTabbable(currentNode)) {
				tabbablesNodes.push(currentNode);
			}
			if (currentNode.tagName === "SLOT") {
				getTabbables(currentNode.assignedNodes(), tabbablesNodes);
			} else {
				getTabbables(currentNode.children, tabbablesNodes);
			}
		});
		return tabbablesNodes;
	};

	exports.getLastTabbableElement = getLastTabbableElement;
	exports.getTabbableElements = getTabbableElements;

	Object.defineProperty(exports, '__esModule', { value: true });

});
