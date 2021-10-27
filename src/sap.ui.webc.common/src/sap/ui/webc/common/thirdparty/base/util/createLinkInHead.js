sap.ui.define(function () { 'use strict';

	const createLinkInHead = (href, attributes = {}) => {
		const link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		Object.entries(attributes).forEach(pair => link.setAttribute(...pair));
		link.href = href;
		document.head.appendChild(link);
		return link;
	};

	return createLinkInHead;

});
