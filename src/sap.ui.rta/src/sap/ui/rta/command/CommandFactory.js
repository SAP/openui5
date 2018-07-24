/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/base/ManagedObject',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/fl/registry/ChangeRegistry',
	'sap/ui/fl/Utils',
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/thirdparty/jquery",
	"sap/base/util/ObjectPath"
],
function(
	ManagedObject,
	ElementUtil,
	OverlayUtil,
	OverlayRegistry,
	ChangeRegistry,
	FlexUtils,
	JsControlTreeModifier,
	jQuery,
	ObjectPath
) {
	"use strict";

	function evaluateTemplateBinding(oElementOverlay, vElement, sAggregationName, mFlexSettings){
		var bTemplateBinding = false;

		var mBoundControl = OverlayUtil.getAggregationInformation(oElementOverlay, sAggregationName);
		if (mBoundControl.elementId) {
			//check for additional binding
			var oBoundControlOverlay = OverlayRegistry.getOverlay(mBoundControl.elementId);
			var oParentElementOverlay = oBoundControlOverlay.getParentElementOverlay();
			var bAdditionalBinding = oParentElementOverlay ?
				OverlayUtil.isInAggregationBinding(oParentElementOverlay, oParentElementOverlay.sParentAggregationName) : false;

			if (bAdditionalBinding) {
				throw new Error("Multiple template bindings are not supported");
			}

			var sOriginalId = vElement.id || vElement.getId();
			var sTemplateId = ElementUtil.extractTemplateId(sOriginalId, mBoundControl);
			if (sTemplateId) {
				Object.assign(mFlexSettings, {
					templateSelector : mBoundControl.elementId,
					originalSelector : sTemplateId,
					content : {
						boundAggregation : mBoundControl.aggregation
					}
				});
				bTemplateBinding = true;
			}
		}
		return bTemplateBinding;
	}

	function adjustSettingsMap(mSettings){
		var fnGetTemplateElementId = function(vElementOrId) {
			var oElement = (typeof vElementOrId === "string") ? sap.ui.getCore().byId(vElementOrId) : vElementOrId;
			var oElementOverlay = OverlayRegistry.getOverlay(oElement);
			if (oElementOverlay) {
				var mBoundControl = OverlayUtil.getAggregationInformation(oElementOverlay, oElementOverlay.sParentAggregationName);
				return ElementUtil.extractTemplateId(oElement.getId(), mBoundControl);
			} else {
				return oElement.getId();
			}
		};
		var fnEvaluateResult = function(vElementOrId) {
			if (!vElementOrId) {
				throw new Error("adjustment for template failed");
			}
		};

		switch (mSettings.name) {
			case "move":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.source.parent = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.source.parent));
				fnEvaluateResult(mSettings.source.parent);
				mSettings.target.parent = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.target.parent));
				fnEvaluateResult(mSettings.target.parent);
				mSettings.movedElements.forEach(function(oMovedElement){
					oMovedElement.element = sap.ui.getCore().byId(fnGetTemplateElementId(oMovedElement.element));
					fnEvaluateResult(oMovedElement.element);
				});
				break;
			case "combine":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.source = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.source));
				fnEvaluateResult(mSettings.source);
				mSettings.combineFields.forEach(function(oCombineField){
					oCombineField = sap.ui.getCore().byId(fnGetTemplateElementId(oCombineField));
					fnEvaluateResult(oCombineField);
				});
				break;
			case "split":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.parentElement = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.parentElement));
				fnEvaluateResult(mSettings.parentElement);
				mSettings.source = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.source));
				fnEvaluateResult(mSettings.source);
				break;
			case "createContainer":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.parentId = fnGetTemplateElementId(mSettings.parentId);
				fnEvaluateResult(mSettings.parentId);
				break;
			case "remove":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.removedElement = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.removedElement));
				fnEvaluateResult(mSettings.removedElement);
				break;
			case "rename":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				mSettings.renamedElement = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.renamedElement));
				fnEvaluateResult(mSettings.renamedElement);
				break;
			case "addXML":
				mSettings.element = sap.ui.getCore().byId(fnGetTemplateElementId(mSettings.element));
				fnEvaluateResult(mSettings.element);
				break;
			default:
				// do nothing
		}
	}

	function configureActionCommand(oElement, oCommand, vAction){
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
	}

	function configureAddXmlCommand(oElement, mSettings, oDesignTimeMetadata){
		var oAction = {
			changeType : "addXML"
		};
		if (oDesignTimeMetadata){
			jQuery.extend(oAction, oDesignTimeMetadata.getAction("addXML", oElement));
		}
		return oAction;
	}

	function configureCreateContainerCommand(oElement, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element || sap.ui.getCore().byId(mSettings.element.id);
		var oAction = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oNewAddedElement)[0];
		return oAction;
	}

	function configureMoveCommand(oElement, mSettings, oDesignTimeMetadata){
		var oMovedElement = mSettings.movedElements[0].element || sap.ui.getCore().byId(mSettings.movedElements[0].id);
		var oAction = oDesignTimeMetadata.getAction("move", oMovedElement);
		// needed for Stashed Controls
		if (!oAction && oDesignTimeMetadata.getMetadata().getName() === "sap.ui.dt.ElementDesignTimeMetadata") {
			oAction = oDesignTimeMetadata.getActionDataFromAggregations("move", oElement).filter(function(oAggAction){
				return oAggAction.aggregation === mSettings.source.aggregation;
			})[0];
		}
		return oAction;
	}

	function configureRenameCommand(oElement, mSettings, oDesignTimeMetadata){
		var oRenamedElement = mSettings.renamedElement;
		var oAction = oDesignTimeMetadata.getAction("rename", oRenamedElement);
		return oAction;
	}

	function configureRemoveCommand(oElement, mSettings, oDesignTimeMetadata){
		var oRemovedElement = mSettings.removedElement;
		if (!oRemovedElement) {
			oRemovedElement = oElement;
		} else if (!(oRemovedElement instanceof ManagedObject)) {
			throw new Error("No valid 'removedElement' found");
		}
		var oAction = oDesignTimeMetadata.getAction("remove", oRemovedElement);
		return oAction;
	}

	function configureCombineCommand(oElement, mSettings, oDesignTimeMetadata){
		var oCombineElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("combine", oCombineElement);
		return oAction;
	}

	function configureSplitCommand(oElement, mSettings, oDesignTimeMetadata){
		var oSplitElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("split", oSplitElement);
		return oAction;
	}

	function configureAddODataPropertyCommand(oElement, mSettings, oDesignTimeMetadata){
		var oNewAddedElement = mSettings.element;
		var oAction = oDesignTimeMetadata.getAction("addODataProperty", oNewAddedElement);
		return oAction;
	}

	function configureRevealCommand(oElement, mSettings, oDesignTimeMetadata){
		var oRevealParent = mSettings.directParent;
		var oAction = oDesignTimeMetadata.getAction("reveal", oRevealParent);
		return oAction;
	}

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
			configure : configureCreateContainerCommand
		},
		"move" : {
			clazz : 'sap.ui.rta.command.Move',
			configure : configureMoveCommand
		},
		"remove" : {
			clazz : 'sap.ui.rta.command.Remove',
			configure : configureRemoveCommand
		},
		"rename" : {
			clazz : 'sap.ui.rta.command.Rename',
			configure : configureRenameCommand
		},
		"addODataProperty" : {
			clazz : 'sap.ui.rta.command.AddODataProperty',
			configure : configureAddODataPropertyCommand
		},
		"reveal" : {
			clazz : 'sap.ui.rta.command.Reveal',
			configure : configureRevealCommand
		},
		"combine" : {
			clazz : 'sap.ui.rta.command.Combine',
			configure : configureCombineCommand
		},
		"split" : {
			clazz : 'sap.ui.rta.command.Split',
			configure : configureSplitCommand
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

	function _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings, sVariantManagementReference) {
		sCommand = sCommand[0].toLowerCase() + sCommand.slice(1); // first char of command name is lower case
		var mCommand = mCommands[sCommand];

		if (!mCommand){
			throw new Error("Command '" + sCommand + "' doesn't exist, check typing");
		}

		var sClassName = mCommand.clazz;

		//TODO: global jquery call found
		jQuery.sap.require(sClassName);
		var Command = ObjectPath.get(sClassName || "");

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

		if (bIsUiElement) {
			var oElementOverlay = OverlayRegistry.getOverlay(vElement);
		}
		if (oAction && oAction.changeOnRelevantContainer) {
			mSettings = jQuery.extend(mSettings, {
				element : oElementOverlay.getRelevantContainer()
			});
			vElement = mSettings.element;
		}

		if (oElementOverlay && vElement.sParentAggregationName) {
			var bTemplateBinding = evaluateTemplateBinding(oElementOverlay, vElement, vElement.sParentAggregationName, mFlexSettings);
		}

		if (bTemplateBinding) {
			adjustSettingsMap(mSettings);
		}
		var oCommand = new Command(mSettings);

		var bSuccessfullConfigured = true; //configuration is optional
		if (mCommand.configure) {
			bSuccessfullConfigured = configureActionCommand(vElement, oCommand, oAction);
		}

		var bPrepareStatus = bSuccessfullConfigured && oCommand.prepare(mFlexSettings, sVariantManagementReference);
		if (bPrepareStatus) {
			return oCommand;
		} else {
			oCommand.destroy();
			return undefined;
		}
	}

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
	 * @param {Object} [mFlexSettings] property bag. See {@link sap.ui.rta.RuntimeAuthoring#setFlexSettings} method for more information
	 */
	CommandFactory.prototype.setFlexSettings = function(mFlexSettings) {
		this.setProperty("flexSettings", jQuery.extend(this.getFlexSettings(), mFlexSettings));
	};

	CommandFactory.prototype.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, sVariantManagementReference) {
		return _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, this.getFlexSettings(), sVariantManagementReference);
	};

	CommandFactory.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings) {
		if (!mFlexSettings) {
			mFlexSettings = {
				layer:"CUSTOMER",
				developerMode: true
			};
		}

		if (mFlexSettings.scenario || mFlexSettings.baseId) {
			var sLRepRootNamespace = FlexUtils.buildLrepRootNamespace(mFlexSettings.baseId, mFlexSettings.scenario, mFlexSettings.projectId);
			mFlexSettings.rootNamespace = sLRepRootNamespace;
			mFlexSettings.namespace = sLRepRootNamespace + "changes/";
		}

		return _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings);
	};

	return CommandFactory;

}, /* bExport= */true);