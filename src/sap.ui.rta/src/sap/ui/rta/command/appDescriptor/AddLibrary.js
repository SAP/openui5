/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/rta/command/AppDescriptorCommand"
], function(
	Lib,
	AppDescriptorCommand
) {
	"use strict";

	/**
	 * Implementation of a command for Add Library change on App Descriptor
	 *
	 * @class
	 * @extends sap.ui.rta.command.AppDescriptorCommand
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.49
	 * @alias sap.ui.rta.command.appDescriptor.AddLibrary
	 */
	var AddLibrary = AppDescriptorCommand.extend("sap.ui.rta.command.appDescriptor.AddLibrary", {
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
		var aPromises = [];

		if (this.getParameters().libraries) {
			var aLibraries = Object.keys(this.getParameters().libraries);
			aLibraries.forEach(function(sLibrary) {
				aPromises.push(Lib.load({name: sLibrary}));
			});
		}

		return Promise.all(aPromises);
	};

	return AddLibrary;
}, /* bExport= */true);
