sap.ui.define(function () { 'use strict';

	const getNormalizedTarget = target => {
		let element = target;
		if (target.shadowRoot && target.shadowRoot.activeElement) {
			element = target.shadowRoot.activeElement;
		}
		return element;
	};

	return getNormalizedTarget;

});
