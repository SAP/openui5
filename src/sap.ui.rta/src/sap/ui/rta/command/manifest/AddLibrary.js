/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/rta/command/ManifestCommand"
], function(
	Lib,
	ManifestCommand
) {
	"use strict";

	/**
	 * Implementation of a command for Add Library change on Manifest
	 *
	 * @class
	 * @extends sap.ui.rta.command.ManifestCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.49
	 * @alias sap.ui.rta.command.manifest.AddLibrary
	 */
	const AddLibrary = ManifestCommand.extend("sap.ui.rta.command.manifest.AddLibrary", {
		metadata: {
			library: "sap.ui.rta",
			events: {}
		}
	});

	AddLibrary.prototype.init = function() {
		this.setChangeType("appdescr_ui5_addLibraries");
	};

	/**
	 * Execute the change (load the required libraries)
	 * @return {Promise} resolved if libraries could be loaded; rejected if not
	 */
	AddLibrary.prototype.execute = function() {
		const aPromises = [];

		if (this.getParameters().libraries) {
			const aLibraries = Object.keys(this.getParameters().libraries);
			aLibraries.forEach(function(sLibrary) {
				aPromises.push(Lib.load({name: sLibrary}));
			});
		}

		return Promise.all(aPromises);
	};

	return AddLibrary;
}, /* bExport= */true);