sap.ui.define(function () { 'use strict';

	const getActiveElement = () => {
		let element = document.activeElement;
		while (element && element.shadowRoot && element.shadowRoot.activeElement) {
			element = element.shadowRoot.activeElement;
		}
		return element;
	};

	return getActiveElement;

});
