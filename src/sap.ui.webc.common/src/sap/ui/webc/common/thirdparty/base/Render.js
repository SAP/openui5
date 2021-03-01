sap.ui.define(['exports', './EventProvider', './RenderQueue', './CustomElementsRegistry', './locale/RTLAwareRegistry'], function (exports, EventProvider, RenderQueue, CustomElementsRegistry, RTLAwareRegistry) { 'use strict';

	const registeredElements = new Set();
	const eventProvider = new EventProvider();
	const invalidatedWebComponents = new RenderQueue();
	let renderTaskPromise,
		renderTaskPromiseResolve;
	let mutationObserverTimer;
	let queuePromise;
	const renderDeferred = async webComponent => {
		invalidatedWebComponents.add(webComponent);
		await scheduleRenderTask();
	};
	const renderImmediately = webComponent => {
		eventProvider.fireEvent("beforeComponentRender", webComponent);
		registeredElements.add(webComponent);
		webComponent._render();
	};
	const cancelRender = webComponent => {
		invalidatedWebComponents.remove(webComponent);
		registeredElements.delete(webComponent);
	};
	const scheduleRenderTask = async () => {
		if (!queuePromise) {
			queuePromise = new Promise(resolve => {
				window.requestAnimationFrame(() => {
					invalidatedWebComponents.process(renderImmediately);
					queuePromise = null;
					resolve();
					if (!mutationObserverTimer) {
						mutationObserverTimer = setTimeout(() => {
							mutationObserverTimer = undefined;
							if (invalidatedWebComponents.isEmpty()) {
								_resolveTaskPromise();
							}
						}, 200);
					}
				});
			});
		}
		await queuePromise;
	};
	const whenDOMUpdated = () => {
		if (renderTaskPromise) {
			return renderTaskPromise;
		}
		renderTaskPromise = new Promise(resolve => {
			renderTaskPromiseResolve = resolve;
			window.requestAnimationFrame(() => {
				if (invalidatedWebComponents.isEmpty()) {
					renderTaskPromise = undefined;
					resolve();
				}
			});
		});
		return renderTaskPromise;
	};
	const whenAllCustomElementsAreDefined = () => {
		const definedPromises = CustomElementsRegistry.getAllRegisteredTags().map(tag => customElements.whenDefined(tag));
		return Promise.all(definedPromises);
	};
	const renderFinished = async () => {
		await whenAllCustomElementsAreDefined();
		await whenDOMUpdated();
	};
	const _resolveTaskPromise = () => {
		if (!invalidatedWebComponents.isEmpty()) {
			return;
		}
		if (renderTaskPromiseResolve) {
			renderTaskPromiseResolve();
			renderTaskPromiseResolve = undefined;
			renderTaskPromise = undefined;
		}
	};
	const reRenderAllUI5Elements = async filters => {
		registeredElements.forEach(element => {
			const tag = element.constructor.getMetadata().getTag();
			const rtlAware = RTLAwareRegistry.isRtlAware(element.constructor);
			const languageAware = element.constructor.getMetadata().isLanguageAware();
			if (!filters || (filters.tag === tag) || (filters.rtlAware && rtlAware) || (filters.languageAware && languageAware)) {
				renderDeferred(element);
			}
		});
		await renderFinished();
	};
	const attachBeforeComponentRender = listener => {
		eventProvider.attachEvent("beforeComponentRender", listener);
	};
	const detachBeforeComponentRender = listener => {
		eventProvider.detachEvent("beforeComponentRender", listener);
	};

	exports.attachBeforeComponentRender = attachBeforeComponentRender;
	exports.cancelRender = cancelRender;
	exports.detachBeforeComponentRender = detachBeforeComponentRender;
	exports.reRenderAllUI5Elements = reRenderAllUI5Elements;
	exports.renderDeferred = renderDeferred;
	exports.renderFinished = renderFinished;
	exports.renderImmediately = renderImmediately;

	Object.defineProperty(exports, '__esModule', { value: true });

});
