sap.ui.define(['./AnimationQueue', './config'], function (AnimationQueue, config) { 'use strict';

	var animate = ({
		beforeStart = config.identity,
		duration = config.defaultDuration,
		element = config.element,
		progress: progressCallback = config.identity,
	}) => {
		let start = null;
		let stopped = false;
		let animationFrame;
		let stop;
		let animate;
		const promise = new Promise((resolve, reject) => {
			animate = timestamp => {
				start = start || timestamp;
				const timeElapsed = timestamp - start;
				const remaining = duration - timeElapsed;
				if (timeElapsed <= duration) {
					const progress = 1 - remaining / duration;
					progressCallback(progress);
					animationFrame = !stopped && requestAnimationFrame(animate);
				} else {
					progressCallback(1);
					resolve();
				}
			};
			stop = () => {
				stopped = true;
				cancelAnimationFrame(animationFrame);
				reject(new Error("animation stopped"));
			};
		}).catch(oReason => oReason);
		AnimationQueue.push(element, () => {
			beforeStart();
			requestAnimationFrame(animate);
			return new Promise(resolve => {
				promise.then(() => resolve());
			});
		});
		return {
			promise: () => promise,
			stop: () => stop,
		};
	};

	return animate;

});
