sap.ui.define([
	"sap/ui/test/utils/nextUIUpdate"
], function(
	nextUIUpdate
) {
	"use strict";

	/**
	* Helper function to await the rendering of the given web component control wrapper.
	* Additionally awaits the definition of the custom-element if needed.
	*
	* @param {module:sap/ui/core/WebComponent} ctrWrapper the control wrapper sub class
	* @returns {Promise} a Promise resolving once the given control wrapper has finished rendering
	*/
	function renderingFor(ctrWrapper) {
		return window.customElements.whenDefined(ctrWrapper.getMetadata().getTag()).then(nextUIUpdate);
	}

	return renderingFor;
});
