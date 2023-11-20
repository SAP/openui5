sap.ui.define(["exports", "./EventProvider", "./RenderQueue", "./CustomElementsRegistry", "./locale/RTLAwareRegistry"], function (_exports, _EventProvider, _RenderQueue, _CustomElementsRegistry, _RTLAwareRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.renderImmediately = _exports.renderFinished = _exports.renderDeferred = _exports.reRenderAllUI5Elements = _exports.detachBeforeComponentRender = _exports.cancelRender = _exports.attachBeforeComponentRender = void 0;
  _EventProvider = _interopRequireDefault(_EventProvider);
  _RenderQueue = _interopRequireDefault(_RenderQueue);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const registeredElements = new Set();
  const eventProvider = new _EventProvider.default();
  const invalidatedWebComponents = new _RenderQueue.default(); // Queue for invalidated web components
  let renderTaskPromise, renderTaskPromiseResolve;
  let mutationObserverTimer;
  let queuePromise;
  /**
   * Schedules a render task (if not already scheduled) to render the component
   *
   * @param webComponent
   * @returns {Promise}
   */
  const renderDeferred = async webComponent => {
    // Enqueue the web component
    invalidatedWebComponents.add(webComponent);
    // Schedule a rendering task
    await scheduleRenderTask();
  };
  /**
   * Renders a component synchronously and adds it to the registry of rendered components
   *
   * @param webComponent
   */
  _exports.renderDeferred = renderDeferred;
  const renderImmediately = webComponent => {
    eventProvider.fireEvent("beforeComponentRender", webComponent);
    registeredElements.add(webComponent);
    webComponent._render();
  };
  /**
   * Cancels the rendering of a component, if awaiting to be rendered, and removes it from the registry of rendered components
   *
   * @param webComponent
   */
  _exports.renderImmediately = renderImmediately;
  const cancelRender = webComponent => {
    invalidatedWebComponents.remove(webComponent);
    registeredElements.delete(webComponent);
  };
  /**
   * Schedules a rendering task, if not scheduled already
   */
  _exports.cancelRender = cancelRender;
  const scheduleRenderTask = async () => {
    if (!queuePromise) {
      queuePromise = new Promise(resolve => {
        window.requestAnimationFrame(() => {
          // Render all components in the queue
          // console.log(`--------------------RENDER TASK START------------------------------`); // eslint-disable-line
          invalidatedWebComponents.process(renderImmediately);
          // console.log(`--------------------RENDER TASK END------------------------------`); // eslint-disable-line
          // Resolve the promise so that callers of renderDeferred can continue
          queuePromise = null;
          resolve();
          // Wait for Mutation observer before the render task is considered finished
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
  /**
   * return a promise that will be resolved once all invalidated web components are rendered
   */
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
    const definedPromises = (0, _CustomElementsRegistry.getAllRegisteredTags)().map(tag => customElements.whenDefined(tag));
    return Promise.all(definedPromises);
  };
  const renderFinished = async () => {
    await whenAllCustomElementsAreDefined();
    await whenDOMUpdated();
  };
  _exports.renderFinished = renderFinished;
  const _resolveTaskPromise = () => {
    if (!invalidatedWebComponents.isEmpty()) {
      // More updates are pending. Resolve will be called again
      return;
    }
    if (renderTaskPromiseResolve) {
      renderTaskPromiseResolve();
      renderTaskPromiseResolve = undefined;
      renderTaskPromise = undefined;
    }
  };
  /**
   * Re-renders all UI5 Elements on the page, with the option to specify filters to rerender only some components.
   *
   * Usage:
   * reRenderAllUI5Elements() -> re-renders all components
   * reRenderAllUI5Elements({tag: "ui5-button"}) -> re-renders only instances of ui5-button
   * reRenderAllUI5Elements({rtlAware: true}) -> re-renders only rtlAware components
   * reRenderAllUI5Elements({languageAware: true}) -> re-renders only languageAware components
   * reRenderAllUI5Elements({themeAware: true}) -> re-renders only themeAware components
   * reRenderAllUI5Elements({rtlAware: true, languageAware: true}) -> re-renders components that are rtlAware or languageAware
   * etc...
   *
   * @public
   * @param {object|undefined} filters - Object with keys that can be "rtlAware" or "languageAware"
   * @returns {Promise<void>}
   */
  const reRenderAllUI5Elements = async filters => {
    registeredElements.forEach(element => {
      const ctor = element.constructor;
      const tag = ctor.getMetadata().getTag();
      const rtlAware = (0, _RTLAwareRegistry.isRtlAware)(ctor);
      const languageAware = ctor.getMetadata().isLanguageAware();
      const themeAware = ctor.getMetadata().isThemeAware();
      if (!filters || filters.tag === tag || filters.rtlAware && rtlAware || filters.languageAware && languageAware || filters.themeAware && themeAware) {
        renderDeferred(element);
      }
    });
    await renderFinished();
  };
  _exports.reRenderAllUI5Elements = reRenderAllUI5Elements;
  const attachBeforeComponentRender = listener => {
    eventProvider.attachEvent("beforeComponentRender", listener);
  };
  _exports.attachBeforeComponentRender = attachBeforeComponentRender;
  const detachBeforeComponentRender = listener => {
    eventProvider.detachEvent("beforeComponentRender", listener);
  };
  _exports.detachBeforeComponentRender = detachBeforeComponentRender;
});