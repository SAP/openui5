/*!
 * ${copyright}
 */

sap.ui.define([
	"./Adaptation"
],
function(
	Adaptation
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
	 * @experimental Since 1.84. This class is experimental. API might be changed in future.
	 */
	var FioriLike = Adaptation.extend("sap.ui.rta.toolbar.FioriLike", {
		metadata: {
			library: "sap.ui.rta"
		},
		renderer: "sap.ui.rta.toolbar.AdaptationRenderer",
		type: "fiori"
	});

	return FioriLike;
});