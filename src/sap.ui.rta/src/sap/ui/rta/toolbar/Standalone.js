/*!
 * ${copyright}
 */

sap.ui.define([
	'./Adaptation'
],
function(
	Adaptation
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
	 * @experimental Since 1.48. This class is experimental. API might be changed in future.
	 */
	var Standalone = Adaptation.extend("sap.ui.rta.toolbar.Standalone", {
		renderer: 'sap.ui.rta.toolbar.BaseRenderer',
		type: 'standalone'
	});

	return Standalone;

}, true);
