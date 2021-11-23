sap.ui.define(['exports', '../Render', '../getSharedResource', '../EventProvider'], function (exports, Render, getSharedResource, EventProvider) { 'use strict';

	const eventProvider = getSharedResource("CustomStyle.eventProvider", new EventProvider());
	const CUSTOM_CSS_CHANGE = "CustomCSSChange";
	const attachCustomCSSChange = listener => {
		eventProvider.attachEvent(CUSTOM_CSS_CHANGE, listener);
	};
	const detachCustomCSSChange = listener => {
		eventProvider.detachEvent(CUSTOM_CSS_CHANGE, listener);
	};
	const fireCustomCSSChange = tag => {
		return eventProvider.fireEvent(CUSTOM_CSS_CHANGE, tag);
	};
	const customCSSFor = getSharedResource("CustomStyle.customCSSFor", {});
	let skipRerender;
	attachCustomCSSChange(tag => {
		if (!skipRerender) {
			Render.reRenderAllUI5Elements({ tag });
		}
	});
	const addCustomCSS = (tag, css) => {
		if (!customCSSFor[tag]) {
			customCSSFor[tag] = [];
		}
		customCSSFor[tag].push(css);
		skipRerender = true;
		try {
			fireCustomCSSChange(tag);
		} finally {
			skipRerender = false;
		}
		return Render.reRenderAllUI5Elements({ tag });
	};
	const getCustomCSS = tag => {
		return customCSSFor[tag] ? customCSSFor[tag].join("") : "";
	};

	exports.addCustomCSS = addCustomCSS;
	exports.attachCustomCSSChange = attachCustomCSSChange;
	exports.detachCustomCSSChange = detachCustomCSSChange;
	exports.getCustomCSS = getCustomCSS;

	Object.defineProperty(exports, '__esModule', { value: true });

});
