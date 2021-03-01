sap.ui.define(function () { 'use strict';

	const whenDOMReady = () => {
		return new Promise(resolve => {
			if (document.body) {
				resolve();
			} else {
				document.addEventListener("DOMContentLoaded", () => {
					resolve();
				});
			}
		});
	};

	return whenDOMReady;

});
