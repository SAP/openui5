sap.ui.define(['./config', './animate'], function (config, animate) { 'use strict';

	var slideDown = ({
		element = config.element,
		duration = config.defaultDuration,
		progress: progressCallback = config.identity,
	}) => {
		let computedStyles,
			paddingTop,
			paddingBottom,
			marginTop,
			marginBottom,
			height;
		let storedOverflow,
			storedPaddingTop,
			storedPaddingBottom,
			storedMarginTop,
			storedMarginBottom,
			storedHeight;
		const animation = animate({
			beforeStart: () => {
				element.style.display = "block";
				computedStyles = getComputedStyle(element);
				paddingTop = parseFloat(computedStyles.paddingTop);
				paddingBottom = parseFloat(computedStyles.paddingBottom);
				marginTop = parseFloat(computedStyles.marginTop);
				marginBottom = parseFloat(computedStyles.marginBottom);
				height = parseFloat(computedStyles.height);
				storedOverflow = element.style.overflow;
				storedPaddingTop = element.style.paddingTop;
				storedPaddingBottom = element.style.paddingBottom;
				storedMarginTop = element.style.marginTop;
				storedMarginBottom = element.style.marginBottom;
				storedHeight = element.style.height;
				element.style.overflow = "hidden";
				element.style.paddingTop = 0;
				element.style.paddingBottom = 0;
				element.style.marginTop = 0;
				element.style.marginBottom = 0;
				element.style.height = 0;
			},
			duration,
			element,
			progress(progress) {
				progressCallback(progress);
				element.style.display = "block";
				element.style.paddingTop = 0 + (paddingTop * progress) + "px";
				element.style.paddingBottom = 0 + (paddingBottom * progress) + "px";
				element.style.marginTop = 0 + (marginTop * progress) + "px";
				element.style.marginBottom = 0 + (marginBottom * progress) + "px";
				element.style.height = 0 + (height * progress) + "px";
			},
		});
		animation.promise().then(() => {
			element.style.overflow = storedOverflow;
			element.style.paddingTop = storedPaddingTop;
			element.style.paddingBottom = storedPaddingBottom;
			element.style.marginTop = storedMarginTop;
			element.style.marginBottom = storedMarginBottom;
			element.style.height = storedHeight;
		});
		return animation;
	};

	return slideDown;

});
