sap.ui.define(function () { 'use strict';

	const createStyleInHead = (cssText, attributes = {}) => {
		const style = document.createElement("style");
		style.type = "text/css";
		Object.entries(attributes).forEach(pair => style.setAttribute(...pair));
		style.textContent = cssText;
		document.head.appendChild(style);
		return style;
	};

	return createStyleInHead;

});
