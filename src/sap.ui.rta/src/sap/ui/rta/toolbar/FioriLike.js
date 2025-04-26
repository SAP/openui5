/*!
 * ${copyright}
 */

sap.ui.define([
	"./Adaptation",
	"sap/ui/rta/toolbar/AdaptationRenderer"
],
function(
	Adaptation,
	AdaptationRenderer
) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.toolbar.FioriLike control
	 *
	 * @class
	 * Contains implementation of Fiori specific toolbar
	 * @extends sap.ui.rta.toolbar.Adaptation
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.84
	 * @alias sap.ui.rta.toolbar.FioriLike
	 */
	var FioriLike = Adaptation.extend("sap.ui.rta.toolbar.FioriLike", {
		metadata: {
			library: "sap.ui.rta"
		},
		renderer: AdaptationRenderer,
		type: "fiori"
	});

	return FioriLike;
});