sap.ui.define(function () { 'use strict';

	const getSingletonElementInstance = (tag, parentElement = document.body) => {
		let el = document.querySelector(tag);
		if (el) {
			return el;
		}
		el = document.createElement(tag);
		return parentElement.insertBefore(el, parentElement.firstChild);
	};

	return getSingletonElementInstance;

});
