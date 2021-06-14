sap.ui.define(['exports'], function (exports) { 'use strict';

	let resizeObserver;
	const observedElements = new Map();
	const getResizeObserver = () => {
		if (!resizeObserver) {
			resizeObserver = new window.ResizeObserver(entries => {
				entries.forEach(entry => {
					const callbacks = observedElements.get(entry.target);
					callbacks.forEach(callback => callback());
				});
			});
		}
		return resizeObserver;
	};
	let observe = (element, callback) => {
		const callbacks = observedElements.get(element) || [];
		if (!callbacks.length) {
			getResizeObserver().observe(element);
		}
		observedElements.set(element, [...callbacks, callback]);
	};
	let unobserve = (element, callback) => {
		const callbacks = observedElements.get(element) || [];
		if (callbacks.length === 0) {
			return;
		}
		const filteredCallbacks = callbacks.filter(fn => fn !== callback);
		if (filteredCallbacks.length === 0) {
			getResizeObserver().unobserve(element);
			observedElements.delete(element);
		} else {
			observedElements.set(element, filteredCallbacks);
		}
	};
	class ResizeHandler {
		static register(element, callback) {
			if (element.isUI5Element) {
				element = element.getDomRef();
			}
			if (element instanceof HTMLElement) {
				observe(element, callback);
			} else {
				console.warn("Cannot register ResizeHandler for element", element);
			}
		}
		static deregister(element, callback) {
			if (element.isUI5Element) {
				element = element.getDomRef();
			}
			if (element instanceof HTMLElement) {
				unobserve(element, callback);
			} else {
				console.warn("Cannot deregister ResizeHandler for element", element);
			}
		}
	}
	const setResizeHandlerObserveFn = fn => {
		observe = fn;
	};
	const setResizeHandlerUnobserveFn = fn => {
		unobserve = fn;
	};

	exports.default = ResizeHandler;
	exports.setResizeHandlerObserveFn = setResizeHandlerObserveFn;
	exports.setResizeHandlerUnobserveFn = setResizeHandlerUnobserveFn;

	Object.defineProperty(exports, '__esModule', { value: true });

});
