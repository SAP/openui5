sap.ui.define(['exports'], function (exports) { 'use strict';

	const observers = new WeakMap();
	let _createObserver = (node, callback, options) => {
		const observer = new MutationObserver(callback);
		observer.observe(node, options);
		return observer;
	};
	let _destroyObserver = observer => {
		observer.disconnect();
	};
	const setCreateObserverCallback = createFn => {
		if (typeof createFn === "function") {
			_createObserver = createFn;
		}
	};
	const setDestroyObserverCallback = destroyFn => {
		if (typeof destroyFn === "function") {
			_destroyObserver = destroyFn;
		}
	};
	const observeDOMNode = (node, callback, options) => {
		const observer = _createObserver(node, callback, options);
		observers.set(node, observer);
	};
	const unobserveDOMNode = node => {
		const observer = observers.get(node);
		if (observer) {
			_destroyObserver(observer);
			observers.delete(node);
		}
	};

	exports.observeDOMNode = observeDOMNode;
	exports.setCreateObserverCallback = setCreateObserverCallback;
	exports.setDestroyObserverCallback = setDestroyObserverCallback;
	exports.unobserveDOMNode = unobserveDOMNode;

	Object.defineProperty(exports, '__esModule', { value: true });

});
