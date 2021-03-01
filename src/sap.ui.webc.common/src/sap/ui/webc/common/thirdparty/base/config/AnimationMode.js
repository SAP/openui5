sap.ui.define(['exports', '../InitialConfiguration', '../types/AnimationMode'], function (exports, InitialConfiguration, AnimationMode) { 'use strict';

	let animationMode;
	const getAnimationMode = () => {
		if (animationMode === undefined) {
			animationMode = InitialConfiguration.getAnimationMode();
		}
		return animationMode;
	};
	const setAnimationMode = newAnimationMode => {
		if (Object.values(AnimationMode).includes(newAnimationMode)) {
			animationMode = newAnimationMode;
		}
	};

	exports.getAnimationMode = getAnimationMode;
	exports.setAnimationMode = setAnimationMode;

	Object.defineProperty(exports, '__esModule', { value: true });

});
