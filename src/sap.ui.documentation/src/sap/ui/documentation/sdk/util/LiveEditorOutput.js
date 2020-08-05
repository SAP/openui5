/*!
 * ${copyright}
 */
// Applies the html of a live-edited code-sample
(function() {
	"use strict";

	/**
	 * Listen for message with the src of the live-edited sample to be applied
	 */
	window.addEventListener("message", function(event) {
		// We must verify that the origin of the message's sender matches our
		// expectations. In this case, we're only planning on accepting messages
		// from our own origin, so we can simply compare the message event's
		// origin to the location of this document. If we get a message from an
		// unexpected host, ignore the message entirely.
		if (event.origin !== (window.location.protocol + "//" + window.location.host)) {
			return;
		}

		var oData = event.data;

		if (!oData || !oData.src || !oData.moduleNameToRequire) {
			return;
		}

		addErrorHandlers();
		preloadModules(oData);
	});

	/**
	 * Preload the modules of the live-edited sample so that
	 * the framework obtains the module content from the editor-supplied src,
	 * insted of making a network request to obtain them
	 *
	 * @param oData the editor-supplied src
	 */
	function preloadModules (oData) {

		// prealod the modules from the live-edited src
		sap.ui.require.preload(oData.src);

		// require the init module
		sap.ui.require([oData.moduleNameToRequire]);
	}

	/**
	 * Listen for errors and display them in the DOM,
	 * so that the user does not need to open the console
	 */
	function addErrorHandlers() {

		window.addEventListener("error", function(error) {
			error.preventDefault();
			var oErrorOutput = document.createElement("span");
			oErrorOutput.innerText = error.message; // use save API
			oErrorOutput.style.cssText = "position:absolute; top:1rem; left:1rem";
			if (!document.body) {
				document.write("<span></span>"); // add content via document.write to ensure document.body is created;
			}
			document.body.appendChild(oErrorOutput);
		});
		window.addEventListener("unhandledrejection", function(event) {
			event.preventDefault();
			var oErrorOutput = document.createElement("span");
			oErrorOutput.innerText = event.reason && event.reason.message; // use save API
			oErrorOutput.style.cssText = "position:absolute; top:1rem; left:1rem";
			if (!document.body) {
				document.write("<span></span>"); // add content via document.write to ensure document.body is created;
			}
			document.body.appendChild(oErrorOutput);
		});
	}

})();