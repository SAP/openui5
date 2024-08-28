/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Element",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/fl/Layer"
], function(
	merge,
	Log,
	ManagedObject,
	Element,
	ElementUtil,
	OverlayRegistry,
	DtUtil,
	FlexUtils,
	Layer
) {
	"use strict";

	function evaluateTemplateBinding(oElementOverlay) {
		var mBoundControl = ElementUtil.getAggregationInformation(oElementOverlay.getElement());
		if (mBoundControl.elementId) {
			// check for additional binding
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
					templateSelector: mBoundControl.elementId,
					originalSelector: sTemplateId,
					content: {
						boundAggregation: mBoundControl.aggregation
					}
				};
			}
		}
		return undefined;
	}

	// For the Move Action the UI control is already moved while the corresponding object in the binding template is in the source position.
	// Therefore we have to overwrite the index of the control in the stack with the source index (iIndex) to determine the needed template object.
	function getTemplateElementId(vElementOrId, iIndex) {
		var oElement = (typeof vElementOrId === "string") ? Element.getElementById(vElementOrId) : vElementOrId;
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

	function configureActionCommand(oCommand, vAction) {
		var sChangeType;
		var bJsOnly = false;
		var bVariantIndependent = false;

		if (typeof vAction === "string") {
			sChangeType = vAction;
		} else if (vAction) {
			sChangeType = vAction.changeType;
			bJsOnly = vAction.jsOnly === true;
			bVariantIndependent = vAction.CAUTION_variantIndependent === true;
		}

		if (!sChangeType) {
			return false;
		}

		oCommand.setChangeType(sChangeType);
		oCommand.setJsOnly(bJsOnly);
		if (oCommand.setVariantIndependent) {
			oCommand.setVariantIndependent(bVariantIndependent);
		} else if (bVariantIndependent) {
			Log.error("the variant independent Flag is not available for the action", sChangeType);
		}
		return true;
	}

	function configureAddXmlCommand(oElement, mSettings, oDesignTimeMetadata) {
		var vAction;
		if (oDesignTimeMetadata) {
			vAction = oDesignTimeMetadata.getAction(mSettings.name, oElement);
		}
		// the change type is not configurable via designtime
		// it can also not be disabled with 'not-adaptable' or null
		var oAction = vAction || {};
		Object.assign(oAction, {
			changeType: mSettings.name
		});
		return oAction;
	}

	function adjustSelectorForCommand(mSettings) {
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
	}

	function configureCreateContainerCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oNewAddedElement = mSettings.element || Element.getElementById(mSettings.element.id);
		var oAction = oDesignTimeMetadata.getActionDataFromAggregations("createContainer", oNewAddedElement)[0];
		return oAction;
	}

	function adjustCreateContainerCommand(mSettings) {
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.parentId = getTemplateElementId(mSettings.parentId);
		evaluateResult(mSettings.parentId);
	}

	function configureMoveCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oMovedElement = mSettings.movedElements[0].element || Element.getElementById(mSettings.movedElements[0].id);
		var oAction = oDesignTimeMetadata.getAction("move", oMovedElement);
		return oAction;
	}

	function adjustMoveCommand(mSettings) {
		var aTemplateMovedElements = mSettings.movedElements.map(function(oMovedElement) {
			var oMovedElementInTemplate = Element.getElementById(getTemplateElementId(oMovedElement.element, oMovedElement.sourceIndex));
			evaluateResult(oMovedElementInTemplate);
			return oMovedElementInTemplate;
		});
		mSettings.movedElements.forEach(function(oMovedElement, index) {
			oMovedElement.element = aTemplateMovedElements[index];
		});
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.source.parent = Element.getElementById(getTemplateElementId(mSettings.source.parent));
		evaluateResult(mSettings.source.parent);
		mSettings.target.parent = Element.getElementById(getTemplateElementId(mSettings.target.parent));
		evaluateResult(mSettings.target.parent);
	}

	function configureLocalResetCommand(oElement, mSettings, oDesignTimeMetadata) {
		return oDesignTimeMetadata.getAction("localReset", oElement);
	}

	function configureRenameCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oRenamedElement = mSettings.renamedElement;
		var oAction = oDesignTimeMetadata.getAction("rename", oRenamedElement);
		return oAction;
	}

	function adjustRenameCommand(mSettings) {
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.renamedElement = Element.getElementById(getTemplateElementId(mSettings.renamedElement));
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
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.removedElement = Element.getElementById(getTemplateElementId(mSettings.removedElement));
		evaluateResult(mSettings.removedElement);
	}

	function configureCombineCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oCombineElement = mSettings.source;
		var oAction = oDesignTimeMetadata.getAction("combine", oCombineElement);
		return oAction;
	}

	function adjustCombineCommand(mSettings) {
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.source = Element.getElementById(getTemplateElementId(mSettings.source));
		evaluateResult(mSettings.source);
		var aTemplateCombineElements = mSettings.combineElements.map(function(oCombineField) {
			oCombineField = Element.getElementById(getTemplateElementId(oCombineField));
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
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		mSettings.parentElement = Element.getElementById(getTemplateElementId(mSettings.parentElement));
		evaluateResult(mSettings.parentElement);
		mSettings.source = Element.getElementById(getTemplateElementId(mSettings.source));
		evaluateResult(mSettings.source);
	}

	function configureAddDelegatePropertyCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oNewAddedElement = mSettings.element;
		return oDesignTimeMetadata.getAction("add", oNewAddedElement, "delegate");
	}

	function adjustAddPropertyCommand(mSettings) {
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
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
		mSettings.element = Element.getElementById(getTemplateElementId(mSettings.element));
		evaluateResult(mSettings.element);
		if (mSettings.revealedElementId) {
			mSettings.revealedElementId = getTemplateElementId(mSettings.revealedElementId);
			evaluateResult(mSettings.revealedElementId);
		}
		if (mSettings.directParent) {
			mSettings.directParent = Element.getElementById(getTemplateElementId(mSettings.directParent));
			evaluateResult(mSettings.directParent);
		}
	}

	function configureCustomAddCommand(oElement, mSettings, oDesignTimeMetadata) {
		var oAddAction = oDesignTimeMetadata.getAction("add", mSettings.element);
		if (oAddAction && oAddAction.custom && typeof oAddAction.custom.getItems === "function") {
			var oAction = {
				...oAddAction.custom,
				changeOnRelevantContainer: mSettings.changeOnRelevantContainer,
				changeType: mSettings.changeType
			};
			delete mSettings.changeOnRelevantContainer; // this property is not required for a sap.ui.rta.command.CustomAdd
			return oAction;
		}
		return undefined;
	}

	function configureAddIFrame(oElement, mSettings, oDesignTimeMetadata) {
		return oDesignTimeMetadata.getAction("addIFrame", mSettings.element) || oDesignTimeMetadata.getActionDataFromAggregations("addIFrame", mSettings.element)[0];
	}

	function configureBindPropertyCommand() {
		return "propertyBindingChange";
	}

	function configurePropertyCommand() {
		return "propertyChange";
	}

	var mCommands = { 	// Command names lower camel case
		composite: {
			clazz: "sap/ui/rta/command/CompositeCommand",
			noSelector: true
		},
		property: {
			clazz: "sap/ui/rta/command/Property",
			adjustForBinding: adjustSelectorForCommand,
			configure: configurePropertyCommand
		},
		bindProperty: {
			clazz: "sap/ui/rta/command/BindProperty",
			configure: configureBindPropertyCommand
		},
		addXML: {
			clazz: "sap/ui/rta/command/AddXML",
			configure: configureAddXmlCommand,
			adjustForBinding: adjustSelectorForCommand
		},
		addXMLAtExtensionPoint: {
			clazz: "sap/ui/rta/command/AddXMLAtExtensionPoint",
			configure: configureAddXmlCommand,
			adjustForBinding: adjustSelectorForCommand
		},
		createContainer: {
			clazz: "sap/ui/rta/command/CreateContainer",
			configure: configureCreateContainerCommand,
			adjustForBinding: adjustCreateContainerCommand
		},
		move: {
			clazz: "sap/ui/rta/command/Move",
			configure: configureMoveCommand,
			adjustForBinding: adjustMoveCommand
		},
		remove: {
			clazz: "sap/ui/rta/command/Remove",
			configure: configureRemoveCommand,
			adjustForBinding: adjustRemoveCommand
		},
		localReset: {
			clazz: "sap/ui/rta/command/LocalReset",
			configure: configureLocalResetCommand
		},
		rename: {
			clazz: "sap/ui/rta/command/Rename",
			configure: configureRenameCommand,
			adjustForBinding: adjustRenameCommand
		},
		addDelegateProperty: {
			clazz: "sap/ui/rta/command/AddProperty",
			configure: configureAddDelegatePropertyCommand,
			adjustForBinding: adjustAddPropertyCommand
		},
		reveal: {
			clazz: "sap/ui/rta/command/Reveal",
			configure: configureRevealCommand,
			adjustForBinding: adjustRevealCommand
		},
		customAdd: {
			clazz: "sap/ui/rta/command/CustomAdd",
			configure: configureCustomAddCommand
		},
		combine: {
			clazz: "sap/ui/rta/command/Combine",
			configure: configureCombineCommand,
			adjustForBinding: adjustCombineCommand
		},
		split: {
			clazz: "sap/ui/rta/command/Split",
			configure: configureSplitCommand,
			adjustForBinding: adjustSplitCommand
		},
		resize: {
			clazz: "sap/ui/rta/command/Resize"
		},
		"switch": {
			clazz: "sap/ui/rta/command/ControlVariantSwitch"
		},
		save: {
			clazz: "sap/ui/rta/command/ControlVariantSave"
		},
		saveAs: {
			clazz: "sap/ui/rta/command/ControlVariantSaveAs"
		},
		setTitle: {
			clazz: "sap/ui/rta/command/ControlVariantSetTitle"
		},
		configure: {
			clazz: "sap/ui/rta/command/ControlVariantConfigure"
		},
		settings: {
			clazz: "sap/ui/rta/command/Settings"
		},
		addLibrary: {
			clazz: "sap/ui/rta/command/appDescriptor/AddLibrary",
			noSelector: true
		},
		appDescriptor: {
			clazz: "sap/ui/rta/command/AppDescriptorCommand",
			noSelector: true
		},
		annotation: {
			clazz: "sap/ui/rta/command/Annotation",
			noSelector: true
		},
		addIFrame: {
			clazz: "sap/ui/rta/command/AddIFrame",
			configure: configureAddIFrame
		},
		compVariantContent: {
			clazz: "sap/ui/rta/command/compVariant/CompVariantContent"
		},
		compVariantSaveAs: {
			clazz: "sap/ui/rta/command/compVariant/CompVariantSaveAs"
		},
		compVariantSwitch: {
			clazz: "sap/ui/rta/command/compVariant/CompVariantSwitch"
		},
		compVariantUpdate: {
			clazz: "sap/ui/rta/command/compVariant/CompVariantUpdate"
		}
	};

	function getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings, sVariantManagementReference) {
		var oCommand;
		sCommand = sCommand[0].toLowerCase() + sCommand.slice(1); // first char of command name is lower case
		var mCommand = mCommands[sCommand];
		var mAllFlexSettings = mFlexSettings;

		if (!mCommand) {
			return Promise.reject(DtUtil.createError("CommandFactory#getCommandFor", `Command '${sCommand}' doesn't exist, check typing`, "sap.ui.rta"));
		}

		return new Promise(function(fnResolve) {
			var sClassName = mCommand.clazz;
			sap.ui.require([sClassName], function(Command) {
				fnResolve(Command);
			});
		})

		.then(function(Command) {
			var bIsUiElement = vElement instanceof ManagedObject;

			// only sap.ui.rta.command.FlexCommand requires a selector property
			if (!mCommand.noSelector && !bIsUiElement) {
				mSettings = { ...mSettings, selector: vElement };
			}

			mSettings = {
				...mSettings,
				element: bIsUiElement ? vElement : undefined,
				name: sCommand
			};

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
					element: oElementOverlay.getRelevantContainer()
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

			oCommand = new Command(mSettings);

			var bSuccessfullyConfigured = true; // configuration is optional
			if (mCommand.configure) {
				bSuccessfullyConfigured = configureActionCommand(oCommand, oAction);
			}

			if (bSuccessfullyConfigured) {
				return oCommand.prepare(mAllFlexSettings, sVariantManagementReference, sCommand);
			}
			return undefined;
		}).then(function(bPrepareStatus) {
			if (bPrepareStatus) {
				return oCommand;
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
	 */
	var CommandFactory = ManagedObject.extend("sap.ui.rta.command.CommandFactory", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				flexSettings: {
					type: "object"
				}
			}
		}
	});

	CommandFactory.prototype.init = function() {
		this.setProperty("flexSettings", {
			layer: Layer.CUSTOMER,
			developerMode: true
		});
	};

	/**
	 * Setter for flexSettings. Extends the current flex Settings by the passed object
	 *
	 * @param {Object} [mFlexSettings] - Property bag. See {@link sap.ui.rta.RuntimeAuthoring#setFlexSettings} method for more information
	 */
	CommandFactory.prototype.setFlexSettings = function(mFlexSettings) {
		this.setProperty("flexSettings", { ...this.getFlexSettings(), ...mFlexSettings });
	};

	/**
	 * Instance-specific method for generating command
	 * @param {sap.ui.core.Element|string} vElement - Could be either an element or a selector for the element for which the command is to be created
	 * @param {string} sCommand - Command type
	 * @param {object} mSettings - Initial settings for the new command (command specific settings, looks different for each and every command)
	 * @param {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata - Contains the action used in the command
	 * @param {string} sVariantManagementReference - Variant management reference
	 * @returns {Promise} A promise which will return the created command
	 */
	CommandFactory.prototype.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, sVariantManagementReference) {
		return getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, this.getFlexSettings(), sVariantManagementReference);
	};

	/**
	 * Static method for generating command
	 * @param {sap.ui.core.Element|string} vElement - Could be either an element or a selector for the element for which the command is to be created
	 * @param {string} sCommand - Command type
	 * @param {object} mSettings -  Initial settings for the new command (command specific settings, looks different for each and every command)
	 * @param {sap.ui.dt.DesignTimeMetadata} oDesignTimeMetadata - Contains the action used in the command
	 * @param {object} [mFlexSettings] - Property bag
	 * @param {string} [mFlexSettings.layer] - The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {boolean} [mFlexSettings.developerMode] - Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {string} [mFlexSettings.baseId] - Base ID of the app
	 * @param {string} [mFlexSettings.projectId] - Project ID
	 * @param {string} [mFlexSettings.scenario] - Key representing the current scenario
	 * @param {string} [mFlexSettings.generator] - Generator of the change. Will be saved in the change
	 * @returns {Promise} A promise which will return the created command
	 */
	CommandFactory.getCommandFor = function(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings) {
		mFlexSettings ||= {
			layer: Layer.CUSTOMER,
			developerMode: true
		};

		if (mFlexSettings.scenario || mFlexSettings.baseId) {
			var sLRepRootNamespace = FlexUtils.buildLrepRootNamespace(mFlexSettings.baseId, mFlexSettings.scenario, mFlexSettings.projectId);
			mFlexSettings.rootNamespace = sLRepRootNamespace;
			mFlexSettings.namespace = `${sLRepRootNamespace}changes/`;
		}

		return getCommandFor(vElement, sCommand, mSettings, oDesignTimeMetadata, mFlexSettings);
	};

	return CommandFactory;
}, /* bExport= */true);
