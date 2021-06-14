sap.ui.define(['./isNodeHidden'], function (isNodeHidden) { 'use strict';

	const isNodeTabbable = node => {
		if (!node) {
			return false;
		}
		const nodeName = node.nodeName.toLowerCase();
		if (node.hasAttribute("data-sap-no-tab-ref")) {
			return false;
		}
		if (isNodeHidden(node)) {
			return false;
		}
		const tabIndex = node.getAttribute("tabindex");
		if (tabIndex !== null && tabIndex !== undefined) {
			return parseInt(tabIndex) >= 0;
		}
		if (nodeName === "a" || /input|select|textarea|button|object/.test(nodeName)) {
			return !node.disabled;
		}
	};

	return isNodeTabbable;

});
