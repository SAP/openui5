sap.ui.define(function () { 'use strict';

	const isElementInView = el => {
		const rect = el.getBoundingClientRect();
		return (
			rect.top >= 0 && rect.left >= 0
				&& rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
				&& rect.right <= (window.innerWidth || document.documentElement.clientWidth)
		);
	};

	return isElementInView;

});
