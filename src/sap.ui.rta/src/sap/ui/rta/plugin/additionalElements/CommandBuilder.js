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
	 */
	const CommandBuilder = {};

	function getRevealDataFromActions(mActions, oRevealedElement) {
		let mRevealData;
		mActions.reveal.elements.some(function(mElement) {
			if (mElement.element.getId() === oRevealedElement.getId()) {
				mRevealData = mElement;
				return false;
			}
			return undefined;
		});

		return mRevealData;
	}

	async function createCommandsForInvisibleElement(mPropertyBag) {
		const oRevealCommandForInvisible = await createRevealCommandForInvisible(
			mPropertyBag.selectedElement, mPropertyBag.actions, mPropertyBag.parents, mPropertyBag.plugin
		);
		mPropertyBag.compositeCommand.addCommand(oRevealCommandForInvisible);
		const oMoveCommandForInvisible = await createMoveCommandForInvisible(
			mPropertyBag.selectedElement, mPropertyBag.parents, mPropertyBag.siblingElement,
			mPropertyBag.index, mPropertyBag.targetAggregation, mPropertyBag.plugin
		);
		if (oMoveCommandForInvisible) {
			mPropertyBag.compositeCommand.addCommand(oMoveCommandForInvisible);
		} else {
			Log.warning(
				`No move action configured for ${mPropertyBag.parents.parent.getMetadata().getName()}, aggregation: ${mPropertyBag.selectedElement.aggregation}`,
				"sap.ui.rta"
			);
		}
		return mPropertyBag.compositeCommand;
	}

	function createRevealCommandForInvisible(mSelectedElement, mActions, mParents, oPlugin) {
		const oRevealedElement = ElementUtil.getElementInstance(mSelectedElement.elementId);
		const oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
		const mRevealData = getRevealDataFromActions(mActions, oRevealedElement);

		const sVMReference = oRevealedElementOverlay ? oPlugin.getVariantManagementReference(oRevealedElementOverlay) : undefined;

		if (mRevealData.action.changeOnRelevantContainer) {
			return oPlugin.getCommandFactory().getCommandFor(oRevealedElement, "reveal", {
				revealedElementId: oRevealedElement.getId(),
				directParent: mParents.parent
			}, mRevealData.designTimeMetadata, sVMReference);
		}
		return oPlugin.getCommandFactory().getCommandFor(oRevealedElement, "reveal", {}, mRevealData.designTimeMetadata, sVMReference);
	}

	function createMoveCommandForInvisible(oSelectedElement, mParents, oSiblingElement, iIndex, sTargetAggregationName, oPlugin) {
		const oRevealedElement = ElementUtil.getElementInstance(oSelectedElement.elementId);
		const oRevealedElementOverlay = OverlayRegistry.getOverlay(oRevealedElement);
		// Elements can also be moved between aggregations inside the parent
		const oSourceParent = oRevealedElementOverlay.getParentElementOverlay().getElement() || mParents.parent;
		const iTempRevealTargetIndex = Utils.getIndex(mParents.parent, oSiblingElement, sTargetAggregationName);
		const iRevealedSourceIndex = Utils.getIndex(oSourceParent, oRevealedElement, oSelectedElement.sourceAggregation) - 1;

		const iRevealTargetIndex = iIndex !== undefined ?
			iIndex : ElementUtil.adjustIndexForMove(oSourceParent, mParents.parent, iRevealedSourceIndex, iTempRevealTargetIndex);

		if (
			iRevealTargetIndex !== iRevealedSourceIndex
			|| mParents.parent !== oRevealedElement.getParent()
			|| oSelectedElement.sourceAggregation !== sTargetAggregationName
		) {
			const oSourceParentOverlay = OverlayRegistry.getOverlay(oRevealedElement) ?
				OverlayRegistry.getOverlay(oRevealedElement).getParentAggregationOverlay() : mParents.relevantContainerOverlay;
			const oSourceParentDesignTimeMetadata = oSourceParentOverlay.getDesignTimeMetadata();
			const sVariantManagementReference = oPlugin.getVariantManagementReference(oRevealedElementOverlay);

			return oPlugin.getCommandFactory().getCommandFor(mParents.relevantContainer, "move", {
				movedElements: [{
					element: oRevealedElement,
					sourceIndex: iRevealedSourceIndex,
					targetIndex: iRevealTargetIndex
				}],
				source: {
					parent: oSourceParent,
					aggregation: oSelectedElement.sourceAggregation
				},
				target: {
					parent: mParents.parent,
					aggregation: sTargetAggregationName
				}
			}, oSourceParentDesignTimeMetadata, sVariantManagementReference);
		}
		return Promise.resolve();
	}

	function areLibDependenciesMissing(oComponent, mRequiredLibraries) {
		const mAppsLibDependencies = oComponent.getManifestEntry("/sap.ui5/dependencies/libs");
		return Object.keys(mRequiredLibraries).some(function(sRequiredLib) {
			return !mAppsLibDependencies[sRequiredLib] || mAppsLibDependencies[sRequiredLib].lazy;
		});
	}

	function createCommandForAddLibrary(mParents, mRequiredLibraries, oParentAggregationDTMetadata, oPlugin) {
		if (mRequiredLibraries) {
			const oComponent = FlUtils.getAppComponentForControl(mParents.relevantContainer);
			if (areLibDependenciesMissing(oComponent, mRequiredLibraries)) {
				const mManifest = oComponent.getManifest();
				const sReference = mManifest["sap.app"].id;
				return oPlugin.getCommandFactory().getCommandFor(mParents.publicParent, "addLibrary", {
					reference: sReference,
					parameters: { libraries: mRequiredLibraries },
					appComponent: oComponent
				}, oParentAggregationDTMetadata);
			}
		}
		return Promise.resolve();
	}

	async function createCommandsForAddViaDelegate(mPropertyBag) {
		const mAddViaDelegateAction = mPropertyBag.actions.addViaDelegate.action;
		const oParentAggregationOverlay = mPropertyBag.parents.parentOverlay.getAggregationOverlay(mPropertyBag.actions.aggregation);
		const oParentAggregationDTMetadata = oParentAggregationOverlay.getDesignTimeMetadata();
		const oCommandForAddLibrary = await createCommandForAddLibrary(
			mPropertyBag.parents, mAddViaDelegateAction.delegateInfo.requiredLibraries, oParentAggregationDTMetadata, mPropertyBag.plugin
		);
		if (oCommandForAddLibrary) {
			mPropertyBag.compositeCommand.addCommand(oCommandForAddLibrary);
		}
		const oAddViaDelegateCommand = await createAddViaDelegateCommand(mPropertyBag, oParentAggregationDTMetadata);
		if (oAddViaDelegateCommand) {
			mPropertyBag.compositeCommand.addCommand(oAddViaDelegateCommand);
		}
		return mPropertyBag.compositeCommand;
	}

	function getODataServiceUriFromManifest(oManifest) {
		let sUri = "";
		if (oManifest) {
			const oSapApp = oManifest.getEntry ? oManifest.getEntry("sap.app") : oManifest["sap.app"];
			if (oSapApp?.dataSources?.mainService?.uri) {
				sUri = oSapApp.dataSources.mainService.uri;
			}
		}
		return sUri;
	}

	function createFieldLabelId(oParentControl, sEntityType, sBindingPath) {
		return (`${oParentControl.getId()}_${sEntityType}_${sBindingPath}`).replace("/", "_");
	}

	function createAddViaDelegateCommand(mPropertyBag, oParentAggregationDTMetadata) {
		const mParents = mPropertyBag.parents;
		const mAddViaDelegateAction = mPropertyBag.actions.addViaDelegate.action;
		const oParent = mAddViaDelegateAction.changeOnRelevantContainer ? mParents.relevantContainer : mParents.parent;
		const oParentOverlay = mAddViaDelegateAction.changeOnRelevantContainer ? mParents.relevantContainerOverlay : mParents.parentOverlay;
		const iAddTargetIndex = Utils.getIndex(
			mParents.parent, mPropertyBag.siblingElement, mPropertyBag.actions.aggregation, oParentAggregationDTMetadata.getData().getIndex
		);

		return mPropertyBag.plugin.getCommandFactory().getCommandFor(mParents.parent, "addDelegateProperty", {
			newControlId: createFieldLabelId(oParent, mPropertyBag.selectedElement.entityType, mPropertyBag.selectedElement.bindingPath),
			index: mPropertyBag.index !== undefined ? mPropertyBag.index : iAddTargetIndex,
			bindingString: mPropertyBag.selectedElement.bindingPath,
			entityType: mPropertyBag.selectedElement.entityType, // needed for custom field support tool
			parentId: mParents.parent.getId(),
			propertyName: mPropertyBag.selectedElement.name,
			oDataServiceVersion: mPropertyBag.selectedElement.oDataServiceVersion,
			oDataServiceUri: getODataServiceUriFromManifest(FlUtils.getAppComponentForControl(mParents.parent).getManifest()),
			modelType: mAddViaDelegateAction.delegateInfo.modelType,
			relevantContainerId: mParents.relevantContainer.getId()
		}, oParentAggregationDTMetadata, mPropertyBag.plugin.getVariantManagementReference(oParentOverlay));
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
	 * @returns {Promise<undefined>} Resolves when the commands are created
	 */
	CommandBuilder.createCommands = async function(mParents, oSiblingElement, mActions, iIndex, aSelectedElements, sTargetAggregation, oPlugin) {
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
			try {
				const oCompositeCommand = await oPlugin.getCommandFactory().getCommandFor(mParents.parent, "composite");
				for (const oSelectedElement of aSelectedElements) {
					const mPropertyBag = {
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
							await createCommandsForInvisibleElement(mPropertyBag);
							break;
						case "delegate":
							await createCommandsForAddViaDelegate(mPropertyBag);
							break;
						default:
							Log.error(`Can't create command for untreated element.type ${oSelectedElement.type}`);
					}
				}

				oPlugin.fireElementModified({
					command: oCompositeCommand
				});
			} catch (oError) {
				throw DtUtils.propagateError(
					oError,
					"AdditionalElementsPlugin#_createCommands",
					"Error occurred during _createCommands execution",
					"sap.ui.rta.plugin"
				);
			}
		}
	};

	return CommandBuilder;
});
