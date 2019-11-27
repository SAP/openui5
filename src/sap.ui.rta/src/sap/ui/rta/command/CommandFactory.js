/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/Utils",
	"sap/ui/dt/Util",
	"sap/base/util/merge"
],
function(
	ManagedObject,
	ElementUtil,
	OverlayRegistry,
	FlexUtils,
	DtUtil,
	merge
) {
	"use strict";

	function evaluateTemplateBinding(oElementOverlay) {
		var mBoundControl = ElementUtil.getAggregationInformation(oElementOverlay.getElement());
		if (mBoundControl.elementId) {
			//check for additional binding
			var oBoundControlOverlay = OverlayRegistry.getOverlay(mBoundControl.elementId);
			var oParentElementOverlay = oBoundControlOverlay.getParentElementOverlay();
			var bAdditionalBinding = oParentElementOverlay ?
				!!ElementUtil.getAggregationInformation(oParentElementOverlay.getElement()).templateId : false;

			if (bAdditionalBinding) {
				throw DtUtil.createError("CommandFactory#evaluateTemplateBinding", "Multiple template bindings are not supported", "sap.ui.rta");
			}

			var sTemplateId = ElementUtil.extractTemplateId(mBoundControl);
			if (sTemplateId) {
				return {
					templateSelector : mBoundControl.elementId,
					originalSelector : sTemplateId,
					content : {
						boundAggregation : mBoundControl.aggregation
					}
				};
			}
		}
		return undefined;
	}

	// For the Move Action the UI control is already moved while the corresponding object in the binding template is in the source position.
	// Therefore we have to overwrite the index of the control in the stack with the source index (iIndex) to determine the needed template object.
	function getTemplateElementId(vElementOrId, iIndex) {
		var oElement = (typeof vElementOrId === "string") ? sap.ui.getCore().byId(vElementOrId) : vElementOrId;
		var oElementOverlay = OverlayRegistry.getOverlay(oElement);
		if (oElementOverlay) {
			var mBoundControl = ElementUtil.getAggregationInformation(oElement);
			if (typeof iIndex === "number") {
				mBoundControl.stack[0].index = iIndex;
			}
			return ElementUtil.extractTemplateId(mBoundControl);
		}
		return oElement.getId();
	}

	function evaluateResult(vElementOrId) {
		if (!vElementOrId) {
			throw new Error("adjustment for template failed");
		}
	}

	function configureActionCommand(oElement, oCommand, vAction) {
		var sChangeType;
		var bJsOnly = false;
		if (typeof (vAction) === "string") {
			sChangeType = vAction;
		} else {
			sChangeType = vAction && vAction.changeType;
			bJsOnly = vAction && vAction.jsOnly;
		}

		if (!sChangeType) {
			return false;
		}

		oCommand.setChangeType(sChangeType);
		oCommand.setJsOnly(bJsOnly);
		return true;
	}

	function configureAddXmlCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oAction = {
			changeType : "addXML"
		};
		if (oDesignTimeMetadata) {
			jQuery.extend(oAction, oDesignTimeMetadata.getAction("addXML", oElement));
		}
		return oAction;
	}

	function adjustSelectorForCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
	}

	function configureCreateContainerCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oNewAddedElement = mSettings.element || sap.ui.getCore().byId(mSettings.element.id);
		var oAction = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oNewAddedElement)[0];
		return oAction;
	}

	function adjustCreateContainerCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.parentId = getTemplateElementId(mSettings.parentId);
		evaluateResult(mSettings.parentId);
	}

	function configureMoveCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oMovedElement = mSettings.movedElements[0].element || sap.ui.getCore().byId(mSettings.movedElements[0].id);
		var oAction = oDesignTimeMetadata.getAction("move", oMovedElement);
		// needed for Stashed Controls
		if (!oAction && oDesignTimeMetadata.getMetadata().getName() === "sap.ui.dt.ElementDesignTimeMetadata") {
			oAction = oDesignTimeMetadata.getActionDataFromAggregations("move", oElement).filter(function(oAggAction) {
				return oAggAction.aggregation === mSettings.source.aggregation;
			})[0];
		}
		return oAction;
	}

	function adjustMoveCommand(mSettings) {
		var aTemplateMovedElements = mSettings.movedElements.map(function(oMovedElement) {
			var oMovedElementInTemplate = sap.ui.getCore().byId(getTemplateElementId(oMovedElement.element, oMovedElement.sourceIndex));
			evaluateResult(oMovedElementInTemplate);
			return oMovedElementInTemplate;
		});
		mSettings.movedElements.forEach(function(oMovedElement, index) {
			oMovedElement.element = aTemplateMovedElements[index];
		});
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.source.parent = sap.ui.getCore().byId(getTemplateElementId(mSettings.source.parent));
		evaluateResult(mSettings.source.parent);
		mSettings.target.parent = sap.ui.getCore().byId(getTemplateElementId(mSettings.target.parent));
		evaluateResult(mSettings.target.parent);
	}

	function configureRenameCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oRenamedElement = mSettings.renamedElement;
		var oAction = oDesignTimeMetadata.getAction("rename", oRenamedElement);
		return oAction;
	}

	function adjustRenameCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.renamedElement = sap.ui.getCore().byId(getTemplateElementId(mSettings.renamedElement));
		evaluateResult(mSettings.renamedElement);
	}

	function configureRemoveCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oRemovedElement = mSettings.removedElement;
		if (!oRemovedElement) {
			oRemovedElement = oElement;
		} else if (!(oRemovedElement instanceof ManagedObject)) {
			throw new Error("No valid 'removedElement' found");
		}
		var oAction = oDesignTimeMetadata.getAction("remove", oRemovedElement);
		return oAction;
	}

	function adjustRemoveCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.removedElement = sap.ui.getCore().byId(getTemplateElementId(mSettings.removedElement));
		evaluateResult(mSettings.removedElement);
	}

	function configureCombineCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oCombineElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("combine", oCombineElement);
		return oAction;
	}

	function adjustCombineCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.source = sap.ui.getCore().byId(getTemplateElementId(mSettings.source));
		evaluateResult(mSettings.source);
		var aTemplateCombineElements = mSettings.combineElements.map(function(oCombineField) {
			oCombineField = sap.ui.getCore().byId(getTemplateElementId(oCombineField));
			evaluateResult(oCombineField);
			return oCombineField;
		});
		mSettings.combineElements = aTemplateCombineElements;
	}

	function configureSplitCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oSplitElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("split", oSplitElement);
		return oAction;
	}

	function adjustSplitCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.parentElement = sap.ui.getCore().byId(getTemplateElementId(mSettings.parentElement));
		evaluateResult(mSettings.parentElement);
		mSettings.source = sap.ui.getCore().byId(getTemplateElementId(mSettings.source));
		evaluateResult(mSettings.source);
	}

	function configureAddODataPropertyCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oNewAddedElement = mSettings.element;
		var oAction = oDesignTimeMetadata.getAction("addODataProperty", oNewAddedElement);
		return oAction;
	}

	function adjustAddODataPropertyCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.parentId = getTemplateElementId(mSettings.parentId);
		evaluateResult(mSettings.parentId);
	}

	function configureRevealCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oRevealedElement = mSettings.element;
		var oAction = oDesignTimeMetadata.getAction("reveal", oRevealedElement);
		return oAction;
	}

	function adjustRevealCommand(mSettings) {
		mSettings.element = sap.ui.getCore().byId(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		if (mSettings.revealedElementId) {
			mSettings.revealedElementId = getTemplateElementId(mSettings.revealedElementId);
			evaluateResult(mSettings.revealedElementId);
		}
		if (mSettings.directParent) {
			mSettings.directParent = sap.ui.getCore().byId(getTemplateElementId(mSettings.directParent));
			evaluateResult(mSettings.directParent);
		}
	}

	function configureCustomAddCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oAddAction = oDesignTimeMetadata.getAction("add", mSettings.element);
		if (oAddAction && oAddAction.custom && typeof oAddAction.custom.getItems === "function") {
			var oAction = {
				changeOnRelevantContainer: mSettings.changeOnRelevantContainer,
				changeType: mSettings.changeType
			};
			delete mSettings["changeOnRelevantContainer"]; // this property is not required for a sap.ui.rta.command.CustomAdd
			return oAction;
		}
	}

	var mCommands = { 	// Command names camel case with first char lower case
		composite : {
			clazz : 'sap.ui.rta.command.CompositeCommand',
			noSelector: true
		},
		property : {
			clazz : 'sap.ui.rta.command.Property',
			adjustForBinding : adjustSelectorForCommand
		},
		bindProperty : {
			clazz : 'sap.ui.rta.command.BindProperty'
		},
		addXML : {
			clazz : 'sap.ui.rta.command.AddXML',
			configure : configureAddXmlCommand,
			adjustForBinding : adjustSelectorForCommand
		},
		createContainer : {
			clazz : 'sap.ui.rta.command.CreateContainer',
			configure : configureCreateContainerCommand,
			adjustForBinding : adjustCreateContainerCommand
		},
		move : {
			clazz : 'sap.ui.rta.command.Move',
			configure : configureMoveCommand,
			adjustForBinding : adjustMoveCommand
		},
		remove : {
			clazz : 'sap.ui.rta.command.Remove',
			configure : configureRemoveCommand,
			adjustForBinding : adjustRemoveCommand
		},
		rename : {
			clazz : 'sap.ui.rta.command.Rename',
			configure : configureRenameCommand,
			adjustForBinding : adjustRenameCommand
		},
		addODataProperty : {
			clazz : 'sap.ui.rta.command.AddODataProperty',
			configure : configureAddODataPropertyCommand,
			adjustForBinding : adjustAddODataPropertyCommand
		},
		reveal : {
			clazz : 'sap.ui.rta.command.Reveal',
			configure : configureRevealCommand,
			adjustForBinding : adjustRevealCommand
		},
		customAdd : {
			clazz : 'sap.ui.rta.command.CustomAdd',
			configure : configureCustomAddCommand
		},
		combine : {
			clazz : 'sap.ui.rta.command.Combine',
			configure : configureCombineCommand,
			adjustForBinding : adjustCombineCommand
		},
		split : {
			clazz : 'sap.ui.rta.command.Split',
			configure : configureSplitCommand,
			adjustForBinding : adjustSplitCommand
		},
		"switch" : {
			clazz : 'sap.ui.rta.command.ControlVariantSwitch'
		},
		duplicate : {
			clazz : 'sap.ui.rta.command.ControlVariantDuplicate'
		},
		setTitle : {
			clazz : 'sap.ui.rta.command.ControlVariantSetTitle'
		},
		configure : {
			clazz : 'sap.ui.rta.command.ControlVariantConfigure'
		},
		settings : {
			clazz : 'sap.ui.rta.command.Settings'
		},
		addLibrary : {
			clazz : 'sap.ui.rta.command.appDescriptor.AddLibrary',
			noSelector: true
		},
		appDescriptor : {
			clazz : 'sap.ui.rta.command.AppDescriptorCommand',
			noSelector: true
		},
		addIFrame : {
			clazz : 'sap.ui.rta.command.AddIFrame'
		}
	};

	function _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings, sVariantManagementReference) {
		sCommand = sCommand[0].toLowerCase() + sCommand.slice(1); // first char of command name is lower case
		var mCommand = mCommands[sCommand];
		var mAllFlexSettings = mFlexSettings;

		if (!mCommand) {
			return Promise.reject(DtUtil.createError("CommandFactory#_getCommandFor", "Command '" + sCommand + "' doesn't exist, check typing", "sap.ui.rta"));
		}

		return new Promise(function(fnResolve) {
			var sClassName = mCommand.clazz;
			sap.ui.require([sClassName.replace(/\./g, "/")], function(Command) {
				fnResolve(Command);
			});
		})

		.then(function(Command) {
			var bIsUiElement = vElement instanceof ManagedObject;

			// only sap.ui.rta.command.FlexCommand requires a selector property
			if (!mCommand.noSelector) {
				mSettings = Object.assign({}, mSettings, !bIsUiElement && {selector : vElement});
			}

			mSettings = Object.assign({}, mSettings, {
				element : bIsUiElement ? vElement : undefined,
				name : sCommand
			});

			var oAction;
			if (mCommand.configure) {
				oAction = mCommand.configure(vElement, mSettings, oDesignTimeMetadata);
			}

			var oElementOverlay;
			if (bIsUiElement) {
				oElementOverlay = OverlayRegistry.getOverlay(vElement);
			}

			if (oAction && oAction.changeOnRelevantContainer) {
				Object.assign(mSettings, {
					element : oElementOverlay.getRelevantContainer()
				});
				vElement = mSettings.element;
				oElementOverlay = OverlayRegistry.getOverlay(vElement);
			}

			var mTemplateSettings;
			if (oElementOverlay && vElement.sParentAggregationName) {
				mTemplateSettings = evaluateTemplateBinding(oElementOverlay);
			}

			if (mTemplateSettings) {
				if (mCommand.adjustForBinding) {
					mCommand.adjustForBinding(mSettings);
				}
				mAllFlexSettings = merge(mTemplateSettings, mAllFlexSettings);
			}

			var oCommand = new Command(mSettings);

			var bSuccessfullConfigured = true; //configuration is optional
			if (mCommand.configure) {
				bSuccessfullConfigured = configureActionCommand(vElement, oCommand, oAction);
			}

			if (bSuccessfullConfigured) {
				return Promise.resolve()
					.then(function() {
						return oCommand.prepare(mAllFlexSettings, sVariantManagementReference);
					})
					.then(function(bPrepareStatus) {
						if (bPrepareStatus) {
							return oCommand;
						}
					});
			}
			oCommand.destroy();
			return undefined;
		});
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
				flexSettings: {
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

	/**
	 * Instance-specific method for generating command
	 * @param {sap.ui.core.Element|string} vElement - could be either an element or a slector for the element for which the command is to be created
	 * @param {string} sCommand - command type
	 * @param {object} mSettings - initial settings for the new command (command specific settings, looks diffrent for each and every command)
	 * @param {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata - contains the action used in the command
	 * @param {string} sVariantManagementReference - variant management reference
	 * @returns {Promise} A promise which will return the created command
	 */
	CommandFactory.prototype.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, sVariantManagementReference) {
		return _getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, this.getFlexSettings(), sVariantManagementReference);
	};

	/**
	 * Static method for generating command
	 * @param {sap.ui.Element|string} vElement - could be either an element or a slector for the element for which the command is to be created
	 * @param {string} sCommand - command type
	 * @param {object} mSettings -  initial settings for the new command (command specific settings, looks diffrent for each and every command)
	 * @param {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata - contains the action used in the command
	 * @param {Object} [mFlexSettings] property bag
	 * @param {String} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {Boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {String} [mFlexSettings.baseId] base ID of the app
	 * @param {String} [mFlexSettings.projectId] project ID
	 * @param {String} [mFlexSettings.scenario] Key representing the current scenario
	 * @returns {Promise} A promise which will return the created command
	 */
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
