/*!
 * ${copyright}
 */
sap.ui.define(['sap/ui/base/ManagedObject', 'sap/ui/dt/ElementUtil', 'sap/ui/dt/OverlayRegistry', 'sap/ui/fl/registry/ChangeRegistry'],
	function(ManagedObject, ElementUtil, OverlayRegistry, ChangeRegistry) {
	"use strict";

	var fnConfigureActionCommand = function(oElement, oCommand, vAction){
		var sChangeType;
		var bJsOnly = false;
		if (typeof (vAction) === "string"){
			sChangeType = vAction;
		} else {
			sChangeType = vAction && vAction.changeType;
			bJsOnly = vAction && vAction.jsOnly;
		}

		if (!sChangeType){
			return false;
		}

		oCommand.setChangeType(sChangeType);
		oCommand.setJsOnly(bJsOnly);
		return true;
	};

	function configureAddXmlCommand(oElement, mSettings, oDesignTimeMetadata){
		var oAction = {
			changeType : "addXML"
		};
		if (oDesignTimeMetadata){
			jQuery.extend(oAction, oDesignTimeMetadata.getAction("addXML", oElement));
		}
		return oAction;
	}

	var fnConfigureCreateContainerCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element || sap.ui.getCore().byId(mSettings.element.id);
		var oAction = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oNewAddedElement)[0];
		return oAction;
	};

	var fnConfigureMoveCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oMovedElement = mSettings.movedElements[0].element || sap.ui.getCore().byId(mSettings.movedElements[0].id);
		var oAction = oDesignTimeMetadata.getAction("move", oMovedElement);
		// needed for Stashed Controls
		if (!oAction && oDesignTimeMetadata.getMetadata().getName() === "sap.ui.dt.ElementDesignTimeMetadata") {
			oAction = oDesignTimeMetadata.getActionDataFromAggregations("move", oElement).filter(function(oAggAction){
				return oAggAction.aggregation === mSettings.source.aggregation;
			})[0];
		}
		return oAction;
	};

	var fnConfigureRenameCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oRenamedElement = mSettings.renamedElement;
		var oAction = oDesignTimeMetadata.getAction("rename", oRenamedElement);
		return oAction;
	};

	var fnConfigureRemoveCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oRemovedElement = mSettings.removedElement;
		if (!oRemovedElement) {
			oRemovedElement = oElement;
		} else if (!(oRemovedElement instanceof ManagedObject)) {
			throw new Error("No valid 'removedElement' found");
		}
		var oAction = oDesignTimeMetadata.getAction("remove", oRemovedElement);
		return oAction;
	};

	var fnConfigureCombineCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oCombineElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("combine", oCombineElement);
		return oAction;
	};

	var fnConfigureSplitCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oSplitElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("split", oSplitElement);
		return oAction;
	};

	var fnConfigureAddODataPropertyCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element;
		var oAction = oDesignTimeMetadata.getAction("addODataProperty", oNewAddedElement);
		return oAction;
	};

	var fnConfigureRevealCommand = function(oElement, mSettings, oDesignTimeMetadata){
		var oRevealParent = mSettings.directParent;
		var oAction = oDesignTimeMetadata.getAction("reveal", oRevealParent);
		return oAction;
	};

	var mCommands = { 	// Command names camel case with first char lower case
		"composite" : {
			clazz : 'sap.ui.rta.command.CompositeCommand'
		},
		"property" : {
			clazz : 'sap.ui.rta.command.Property'
		},
		"bindProperty" : {
			clazz : 'sap.ui.rta.command.BindProperty'
		},
		"addXML" : {
			clazz : 'sap.ui.rta.command.AddXML',
			configure : configureAddXmlCommand
		},
		"createContainer" : {
			clazz : 'sap.ui.rta.command.CreateContainer',
			configure : fnConfigureCreateContainerCommand
		},
		"move" : {
			clazz : 'sap.ui.rta.command.Move',
			configure : fnConfigureMoveCommand
		},
		"remove" : {
			clazz : 'sap.ui.rta.command.Remove',
			configure : fnConfigureRemoveCommand
		},
		"rename" : {
			clazz : 'sap.ui.rta.command.Rename',
			configure : fnConfigureRenameCommand
		},
		"addODataProperty" : {
			clazz : 'sap.ui.rta.command.AddODataProperty',
			configure : fnConfigureAddODataPropertyCommand
		},
		"reveal" : {
			clazz : 'sap.ui.rta.command.Reveal',
			configure : fnConfigureRevealCommand
		},
		"combine" : {
			clazz : 'sap.ui.rta.command.Combine',
			configure : fnConfigureCombineCommand
		},
		"split" : {
			clazz : 'sap.ui.rta.command.Split',
			configure : fnConfigureSplitCommand
		},
		"switch" : {
			clazz : 'sap.ui.rta.command.ControlVariantSwitch'
		},
		"duplicate" : {
			clazz : 'sap.ui.rta.command.ControlVariantDuplicate'
		},
		"setTitle" : {
			clazz : 'sap.ui.rta.command.ControlVariantSetTitle'
		},
		"configure" : {
			clazz : 'sap.ui.rta.command.ControlVariantConfigure'
		},
		"settings" : {
			clazz : 'sap.ui.rta.command.Settings'
		},
		"addLibrary" : {
			clazz : 'sap.ui.rta.command.appDescriptor.AddLibrary'
		},
		"appDescriptor" : {
			clazz : 'sap.ui.rta.command.AppDescriptorCommand'
		}
	};

	var _getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings, sVariantManagementReference) {
		sCommand = sCommand[0].toLowerCase() + sCommand.slice(1); // first char of command name is lower case
		var mCommand = mCommands[sCommand];

		if (!mCommand){
			throw new Error("Command '" + sCommand + "' doesn't exist, check typing");
		}

		var sClassName = mCommand.clazz;

		jQuery.sap.require(sClassName);
		var Command = jQuery.sap.getObject(sClassName);

		var bIsUiElement = vElement instanceof sap.ui.base.ManagedObject;
		mSettings = jQuery.extend(mSettings, {
			element : bIsUiElement ? vElement : undefined,
			selector : bIsUiElement ? undefined : vElement,
			name : sCommand
		});

		var oAction;
		if (mCommand.configure) {
			oAction = mCommand.configure(vElement, mSettings, oDesignTimeMetadata);
		}

		var oElementOverlay;
		if (oAction && oAction.changeOnRelevantContainer) {
			oElementOverlay = OverlayRegistry.getOverlay(vElement);
			mSettings = jQuery.extend(mSettings, {
				element : oElementOverlay.getRelevantContainer()
			});
			vElement = mSettings.element;
		}

		var oCommand = new Command(mSettings);

		var bSuccessfullConfigured = true; //configuration is optional
		if (mCommand.configure) {
			bSuccessfullConfigured = fnConfigureActionCommand(vElement, oCommand, oAction);
		}

		var bPrepareStatus = bSuccessfullConfigured && oCommand.prepare(mFlexSettings, sVariantManagementReference);
		if (bPrepareStatus) {
			return oCommand;
		} else {
			oCommand.destroy();
			return undefined;
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
	 * @since 1.34
	 * @alias sap.ui.rta.command.CommandFactory
	 * @experimental Since 1.34. This class is experimental and provides only limited functionality. Also the API might be
	 *               changed in future.
	 */
	var CommandFactory = ManagedObject.extend("sap.ui.rta.command.CommandFactory", {
		metadata : {
			library : "sap.ui.rta",
			properties : {
				"flexSettings": {
					type: "object"
				}
			},
			associations : {},
			events : {}
		}
	});

	CommandFactory.prototype.init = function() {
		this.setProperty("flexSettings", {
			layer:"CUSTOMER",
			developerMode: true
		});
	};

	/**
	 * Setter for flexSettings
	 *
	 * @param {Object} [mFlexSettings] property bag
	 * @param {String} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {Boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {String} [mFlexSettings.namespace] Namespace for changes inside LREP
	 */
	CommandFactory.prototype.setFlexSettings = function(mFlexSettings) {
		this.setProperty("flexSettings", jQuery.extend(this.getFlexSettings(), mFlexSettings));
	};

	CommandFactory.prototype.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, sVariantManagementReference) {
		return _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, this.getFlexSettings(), sVariantManagementReference);
	};

	CommandFactory.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings) {
		return _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings);
	};

	return CommandFactory;

}, /* bExport= */true);
