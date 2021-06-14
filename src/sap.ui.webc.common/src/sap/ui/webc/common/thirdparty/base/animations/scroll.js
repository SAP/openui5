sap.ui.define(['./animate', './config'], function (animate, config) { 'use strict';

	var scroll = ({
		element = config.element,
		duration = config.duration,
		progress: progressCallback = config.identity,
		dx = 0,
		dy = 0,
	}) => {
		let scrollLeft;
		let scrollTop;
		return animate({
			beforeStart: () => {
				scrollLeft = element.scrollLeft;
				scrollTop = element.scrollTop;
			},
			duration,
			element,
			progress: progress => {
				progressCallback(progress);
				element.scrollLeft = scrollLeft + (progress * dx);
				element.scrollTop = scrollTop + (progress * dy);
			},
		});
	};

	return scroll;

});
