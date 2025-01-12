/*!
 * ${copyright}
 */

sap.ui.define([
	"./Adaptation",
	"./AdaptationRenderer"
],
function(
	Adaptation,
	AdaptationRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.Standalone control
	 *
	 * @class
	 * Contains implementation of Standalone toolbar
	 * @extends sap.ui.rta.toolbar.Adaptation
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.48
	 * @alias sap.ui.rta.toolbar.Standalone
	 */
	var Standalone = Adaptation.extend("sap.ui.rta.toolbar.Standalone", {
		metadata: {
			library: "sap.ui.rta"
		},
		renderer: AdaptationRenderer,
		type: "standalone"
	});

	return Standalone;
});
