/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/Man			agedObject'], function(ManagedObject) {
	"use strict";

	var mCommands = {
		"Move" : {
			findClass : function(oElement, sCommand, mSettings) {
				var oMovedElement = (mSettings && mSettings.movedElements && mSettings.movedElements.length > 0)
						? mSettings.movedElements[0]
						: undefined;
				var oElementToBeAnalyzed = oMovedElement ? oMovedElement.element : oElement;
				var sType = oElementToBeAnalyzed.getMetadata().getName();
				// TODO: this is too unspecific - could also be a 'normal' Form. The context (SImpleFOrm) shall be taken into
				// account
				if (sType === "sap.ui.layout.form.FormContainer" || sType === "sap.ui.layout.form.FormElement") {
					jQuery.sap.require("sap.ui.dt.command.SimpleFormMove");
					return sap.ui.dt.command.SimpleFormMove;
				} else {
					jQuery.sap.require("sap.ui.dt.command.Move");
					return sap.ui.dt.command.Move;
				}
			}
		}
	};

	/**
	 * Factory for commands. Shall handle the control specific command configuration.
	 *
	 * @class
	 * @extends sap.ui.base.ManagedObject
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.40
	 * @alias sap.ui.dt.command.CommandFactory
	 * @experimental Since 1.40. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CommandFactory = ManagedObject.extend("sap.ui.dt.command.CommandFactory", {
		metadata : {
			library : "sap.ui.dt",
			properties : {},
			associations : {},
			events : {}
		}
	});

	CommandFactory.getCommandFor = function(oElement, sCommand, mSettings) {
		var mCommand = mCommands[sCommand];
		var Command = mCommand.clazz;
		if (!Command && mCommand.findClass) {
			Command = mCommand.findClass(oElement, sCommand, mSettings);
		}

		mSettings = jQuery.extend(mSettings, {
			element : oElement,
			name : sCommand
		});

		var oCommand = new Command(mSettings);

		return oCommand;
	};

	return CommandFactory;

}, /* bExport= */true);
