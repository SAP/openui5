sap.ui.define(["exports", "../Render", "../getSharedResource", "../EventProvider"], function (_exports, _Render, _getSharedResource, _EventProvider) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getCustomCSS = _exports.detachCustomCSSChange = _exports.attachCustomCSSChange = _exports.addCustomCSS = void 0;
  _getSharedResource = _interopRequireDefault(_getSharedResource);
  _EventProvider = _interopRequireDefault(_EventProvider);
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
  const getEventProvider = () => (0, _getSharedResource.default)("CustomStyle.eventProvider", new _EventProvider.default());
  const CUSTOM_CSS_CHANGE = "CustomCSSChange";
  const attachCustomCSSChange = listener => {
    getEventProvider().attachEvent(CUSTOM_CSS_CHANGE, listener);
  };
  _exports.attachCustomCSSChange = attachCustomCSSChange;
  const detachCustomCSSChange = listener => {
    getEventProvider().detachEvent(CUSTOM_CSS_CHANGE, listener);
  };
  _exports.detachCustomCSSChange = detachCustomCSSChange;
  const fireCustomCSSChange = tag => {
    return getEventProvider().fireEvent(CUSTOM_CSS_CHANGE, tag);
  };
  const getCustomCSSFor = () => (0, _getSharedResource.default)("CustomStyle.customCSSFor", {});
  // Listen to the eventProvider, in case other copies of this CustomStyle module fire this
  // event, and this copy would therefore need to reRender the ui5 webcomponents; but
  // don't reRender if it was this copy that fired the event to begin with.
  let skipRerender;
  attachCustomCSSChange(tag => {
    if (!skipRerender) {
      (0, _Render.reRenderAllUI5Elements)({
        tag
      });
    }
  });
  const addCustomCSS = (tag, css) => {
    const customCSSFor = getCustomCSSFor();
    if (!customCSSFor[tag]) {
      customCSSFor[tag] = [];
    }
    customCSSFor[tag].push(css);
    skipRerender = true;
    try {
      // The event is fired and the attached event listeners are all called synchronously
      // The skipRerender flag will be used to avoid calling reRenderAllUI5Elements twice when it is this copy
      // of CustomStyle.js which is firing the `CustomCSSChange` event.
      fireCustomCSSChange(tag);
    } finally {
      skipRerender = false;
    }
    return (0, _Render.reRenderAllUI5Elements)({
      tag
    });
  };
  _exports.addCustomCSS = addCustomCSS;
  const getCustomCSS = tag => {
    const customCSSFor = getCustomCSSFor();
    return customCSSFor[tag] ? customCSSFor[tag].join("") : "";
  };
  _exports.getCustomCSS = getCustomCSS;
});