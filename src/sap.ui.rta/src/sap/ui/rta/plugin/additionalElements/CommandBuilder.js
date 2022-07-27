/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/fl/Utils",
	"sap/ui/rta/Utils"
], function(
	Log,
	ElementUtil,
	OverlayRegistry,
	DtUtils,
	FlUtils,
	Utils
) {
	"use strict";

	/**
	 * Helper object to build the RTA commands resulting from the AdditionalElements Plugin
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.94
	 * @experimental Since 1.94. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var CommandBuilder = {};

	function getRevealDataFromActions(mActions, oRevealedElement) {
		var mRevealData;
		mActions.reveal.elements.some(function(mElement) {
			if (mElement.element.getId() === oRevealedElement.getId()) {
				mRevealData = mElement;
				return false;
			}
			return undefined;
		});

		return mRevealData;
	}

	function createCommandsForInvisibleElement(mPropertyBag) {
		var oCompositeCommand = mPropertyBag.compositeCommand;
		var oSelectedElement = mPropertyBag.selectedElement;
		var mParents = mPropertyBag.parents;
		var oSiblingElement = mPropertyBag.siblingElement;
		var mActions = mPropertyBag.actions;
		var iIndex = mPropertyBag.index;
		var sTargetAggregation = mPropertyBag.targetAggregation;
		var oPlugin = mPropertyBag.plugin;
		return createRevealCommandForInvisible(oSelectedElement, mActions, mParents, oPlugin)
			.then(function(oRevealCommandForInvisible) {
				oCompositeCommand.addCommand(oRevealCommandForInvisible);
				return createMoveCommandForInvisible(oSelectedElement, mParents, oSiblingElement, iIndex, sTargetAggregation, oPlugin);
			})
			.then(function(oMoveCommandForInvisible) {
				if (oMoveCommandForInvisible) {
					oCompositeCommand.addCommand(oMoveCommandForInvisible);
				} else {
					Log.warning("No move action configured for "
						+ mParents.parent.getMetadata().getName()
						+ ", aggregation: " + oSelectedElement.aggregation, "sap.ui.rta");
				}
				return oCompositeCommand;
			});
	}

	function createRevealCommandForInvisible(mSelectedElement, mActions, mParents, oPlugin) {
		var oRevealedElement = ElementUtil.getElementInstance(mSelectedElement.elementId);
		var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
		var mRevealData = getRevealDataFromActions(mActions, oRevealedElement);

		var oDesignTimeMetadata = mRevealData.designTimeMetadata;
		var oRevealAction = mRevealData.action;

		var sVariantManagementReference;
		if (oRevealedElementOverlay) {
			sVariantManagementReference = oPlugin.getVariantManagementReference(oRevealedElementOverlay);
		}

		if (oRevealAction.changeOnRelevantContainer) {
			return oPlugin.getCommandFactory().getCommandFor(oRevealedElement, "reveal", {
				revealedElementId: oRevealedElement.getId(),
				directParent: mParents.parent
			}, oDesignTimeMetadata, sVariantManagementReference);
		}
		return oPlugin.getCommandFactory().getCommandFor(
			oRevealedElement,
			"reveal",
			{ },
			oDesignTimeMetadata,
			sVariantManagementReference
		);
	}

	function createMoveCommandForInvisible(oSelectedElement, mParents, oSiblingElement, iIndex, sTargetAggregationName, oPlugin) {
		var oRevealedElement = ElementUtil.getElementInstance(oSelectedElement.elementId);
		var oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
		//Elements can also be moved between aggregations inside the parent
		var sSourceAggregationName = oSelectedElement.sourceAggregation;
		var oSourceParent = oRevealedElementOverlay.getParentElementOverlay().getElement() || mParents.parent;
		var oTargetParent = mParents.parent;
		var iRevealTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, sTargetAggregationName);
		var iRevealedSourceIndex = Utils.getIndex(oSourceParent, oRevealedElement, sSourceAggregationName) - 1;

		iRevealTargetIndex = iIndex !== undefined ?
			iIndex : ElementUtil.adjustIndexForMove(oSourceParent, oTargetParent, iRevealedSourceIndex, iRevealTargetIndex);

		if (iRevealTargetIndex !== iRevealedSourceIndex
			|| mParents.parent !== oRevealedElement.getParent()
			|| sSourceAggregationName !== sTargetAggregationName
		) {
			var oSourceParentOverlay = OverlayRegistry.getOverlay(oRevealedElement) ?
				OverlayRegistry.getOverlay(oRevealedElement).getParentAggregationOverlay() : mParents.relevantContainerOverlay;
			var SourceParentDesignTimeMetadata = oSourceParentOverlay.getDesignTimeMetadata();
			var sVariantManagementReference = oPlugin.getVariantManagementReference(oRevealedElementOverlay);

			return oPlugin.getCommandFactory().getCommandFor(mParents.relevantContainer, "move", {
				movedElements: [{
					element: oRevealedElement,
					sourceIndex: iRevealedSourceIndex,
					targetIndex: iRevealTargetIndex
				}],
				source: {
					parent: oSourceParent,
					aggregation: sSourceAggregationName
				},
				target: {
					parent: oTargetParent,
					aggregation: sTargetAggregationName
				}
			}, SourceParentDesignTimeMetadata, sVariantManagementReference);
		}
		return Promise.resolve();
	}

	function areLibDependenciesMissing(oComponent, mRequiredLibraries) {
		var mAppsLibDependencies = oComponent.getManifestEntry("/sap.ui5/dependencies/libs");
		return Object.keys(mRequiredLibraries).some(function(sRequiredLib) {
			return !mAppsLibDependencies[sRequiredLib];
		});
	}

	function createCommandForAddLibrary(mParents, mRequiredLibraries, oParentAggregationDTMetadata, oPlugin) {
		if (mRequiredLibraries) {
			var oComponent = FlUtils.getAppComponentForControl(mParents.relevantContainer);
			var bLibsMissing = areLibDependenciesMissing(oComponent, mRequiredLibraries);
			if (bLibsMissing) {
				var mManifest = oComponent.getManifest();
				var sReference = mManifest["sap.app"].id;
				return oPlugin.getCommandFactory().getCommandFor(mParents.publicParent, "addLibrary", {
					reference: sReference,
					parameters: { libraries: mRequiredLibraries },
					appComponent: oComponent
				}, oParentAggregationDTMetadata);
			}
		}
		return Promise.resolve();
	}

	function createCommandsForAddViaDelegate(mPropertyBag) {
		var oCompositeCommand = mPropertyBag.compositeCommand;
		var mAddViaDelegateAction = mPropertyBag.actions.addViaDelegate.action;
		var mRequiredLibraries = mAddViaDelegateAction.delegateInfo.requiredLibraries;
		var oParentAggregationOverlay = mPropertyBag.parents.parentOverlay.getAggregationOverlay(mPropertyBag.actions.aggregation);
		var oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
		return createCommandForAddLibrary(mPropertyBag.parents, mRequiredLibraries, oParentAggregationDTMetadata, mPropertyBag.plugin)
			.then(function(oCommandForAddLibrary) {
				if (oCommandForAddLibrary) {
					oCompositeCommand.addCommand(oCommandForAddLibrary);
				}
				return createAddViaDelegateCommand(mPropertyBag, oParentAggregationDTMetadata);
			})
			.then(function(oAddViaDelegateCommand) {
				if (oAddViaDelegateCommand) {
					oCompositeCommand.addCommand(oAddViaDelegateCommand);
				}
				return oCompositeCommand;
			});
	}

	function getODataServiceUriFromManifest(oManifest) {
		var sUri = "";
		if (oManifest) {
			var oSapApp = oManifest.getEntry ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
			if (
				oSapApp && oSapApp.dataSources
				&& oSapApp.dataSources.mainService
				&& oSapApp.dataSources.mainService.uri
			) {
				sUri = oSapApp.dataSources.mainService.uri;
			}
		}
		return sUri;
	}

	function createAddViaDelegateCommand(mPropertyBag, oParentAggregationDTMetadata) {
		var oSelectedElement = mPropertyBag.selectedElement;
		var mParents = mPropertyBag.parents;
		var oSiblingElement = mPropertyBag.siblingElement;
		var mActions = mPropertyBag.actions;
		var iIndex = mPropertyBag.index;
		var oPlugin = mPropertyBag.plugin;
		var mAddViaDelegateAction = mActions.addViaDelegate.action;
		var oParent = mAddViaDelegateAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
		var oParentOverlay = mAddViaDelegateAction.changeOnRelevantContainer ? mParents.relevantContainerOverlay : mParents.parentOverlay;
		var sVariantManagementReference = oPlugin.getVariantManagementReference(oParentOverlay);
		var iAddTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, mActions.aggregation, oParentAggregationDTMetadata.getData().getIndex);
		var sCommandName = "addDelegateProperty";
		var oManifest = FlUtils.getAppComponentForControl(mParents.parent).getManifest();
		var sServiceUri = getODataServiceUriFromManifest(oManifest);

		return oPlugin.getCommandFactory().getCommandFor(mParents.parent, sCommandName, {
			newControlId: Utils.createFieldLabelId(oParent, oSelectedElement.entityType, oSelectedElement.bindingPath),
			index: iIndex !== undefined ? iIndex : iAddTargetIndex,
			bindingString: oSelectedElement.bindingPath,
			entityType: oSelectedElement.entityType, // needed for custom field support tool
			parentId: mParents.parent.getId(),
			propertyName: oSelectedElement.name,
			oDataServiceVersion: oSelectedElement.oDataServiceVersion,
			oDataServiceUri: sServiceUri,
			modelType: mAddViaDelegateAction.delegateInfo.modelType,
			relevantContainerId: mParents.relevantContainer.getId()
		}, oParentAggregationDTMetadata, sVariantManagementReference);
	}

	/**
	 * Creates the commands resulting from the add actions
	 * @param {object} mParents - Object containing information about the element's parents
	 * @param {sap.ui.core.Element} oSiblingElement - Sibling element used to calculate target indices
	 * @param {object} mActions - Object containing data for the different add actions
	 * @param {int} iIndex - Index where the element shall be inserted
	 * @param {Array<sap.ui.core.Element>} aSelectedElements - Selected elements when the action was triggered
	 * @param {string} sTargetAggregation - The aggregation where the element is being inserted
	 * @param {sap.ui.rta.plugin.additionalElements.AdditionalElementsPlugin} oPlugin - Instance of the AdditionalElementsPlugin
	 * @returns {Promise} Resolving when the commands are created
	 */
	CommandBuilder.createCommands = function(mParents, oSiblingElement, mActions, iIndex, aSelectedElements, sTargetAggregation, oPlugin) {
		// sort elements by label in descending order. When added the fields will be in ascending order on the UI
		aSelectedElements.sort(function(oElement1, oElement2) {
			if (oElement1.label > oElement2.label) {
				return -1;
			}
			if (oElement1.label < oElement2.label) {
				return 1;
			}
			return 0;
		});

		if (aSelectedElements.length > 0) {
			return oPlugin.getCommandFactory().getCommandFor(mParents.parent, "composite")

					.then(function(oCompositeCommand) {
						var oPromise = Promise.resolve();
						aSelectedElements.forEach(function(oSelectedElement) {
							var mPropertyBag = {
								compositeCommand: oCompositeCommand,
								selectedElement: oSelectedElement,
								parents: mParents,
								siblingElement: oSiblingElement,
								actions: mActions,
								index: iIndex,
								targetAggregation: sTargetAggregation,
								plugin: oPlugin
							};
							switch (oSelectedElement.type) {
								case "invisible":
									oPromise = oPromise.then(
										createCommandsForInvisibleElement.bind(this, mPropertyBag));
									break;
								case "delegate":
									oPromise = oPromise.then(
										createCommandsForAddViaDelegate.bind(this, mPropertyBag));
									break;
								default:
									Log.error("Can't create command for untreated element.type " + oSelectedElement.type);
							}
						}, this);
						return oPromise.then(function() { return oCompositeCommand; });
					}.bind(this))

					.then(function(oCompositeCommand) {
						oPlugin.fireElementModified({
							command: oCompositeCommand
						});
					})

					.catch(function(vMessage) {
						throw DtUtils.propagateError(
							vMessage,
							"AdditionalElementsPlugin#_createCommands",
							"Error occurred during _createCommands execution",
							"sap.ui.rta.plugin"
						);
					});
		}
		return Promise.resolve();
	};

	return CommandBuilder;
});
