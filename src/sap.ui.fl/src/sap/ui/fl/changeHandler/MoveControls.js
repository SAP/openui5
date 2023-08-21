/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/fl/changeHandler/condenser/Classification"
],
function(
	Log,
	CondenserClassification
) {
	"use strict";

	/**
	 * Change handler for moving of an element.
	 *
	 * @alias sap.ui.fl.changeHandler.MoveControls
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.46
	 */
	var MoveControls = { };

	// Defines object which contains constants used in the handler
	MoveControls.SOURCE_ALIAS = "source";
	MoveControls.TARGET_ALIAS = "target";
	MoveControls.MOVED_ELEMENTS_ALIAS = "movedElements";

	 function checkConditions(oChange, oModifier, oView, oAppComponent) {
		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeContent = oChange.getContent();

		if (!oChangeContent || !oChangeContent.movedElements || oChangeContent.movedElements.length === 0) {
			throw new Error("Change format invalid");
		}
		if (!oChangeContent.source || !oChangeContent.source.selector) {
			throw new Error("No source supplied for move");
		}
		if (!oChangeContent.target || !oChangeContent.target.selector) {
			throw new Error("No target supplied for move");
		}
		if (!oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView)) {
			throw new Error("Move source parent not found");
		}
		if (!oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView)) {
			throw new Error("Move target parent not found");
		}
		if (!oChangeContent.source.selector.aggregation) {
			throw new Error("No source aggregation supplied for move");
		}
		if (!oChangeContent.target.selector.aggregation) {
			throw new Error("No target aggregation supplied for move");
		}
	}

	async function getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView) {
		if (!mMovedElement.selector && !mMovedElement.id) {
			throw new Error("Change format invalid - moveElements element has no id attribute");
		}
		if (typeof mMovedElement.targetIndex !== "number") {
			throw new Error(
				`Missing targetIndex for element with id '${mMovedElement.selector.id}' in movedElements supplied`
			);
		}

		const oControl = await oModifier.bySelector(mMovedElement.selector || mMovedElement.id, oAppComponent, oView);
		if (!oControl) {
			throw new Error(`Control to move was not found. Id: '${mMovedElement.selector.id}'`);
		}
		return oControl;
	}

	function checkCompleteChangeContentConditions(mSpecificChangeInfo) {
		if (!mSpecificChangeInfo.movedElements) {
			throw new Error("mSpecificChangeInfo.movedElements attribute required");
		}
		if (mSpecificChangeInfo.movedElements.length === 0) {
			throw new Error("MovedElements array is empty");
		}

		mSpecificChangeInfo.movedElements.forEach(function(mElement) {
			if (!mElement.id) {
				throw new Error("MovedControls element has no id attribute");
			}
			if (typeof (mElement.sourceIndex) !== "number") {
				throw new Error("SourceIndex attribute at MovedElements element is no number");
			}
			if (typeof (mElement.targetIndex) !== "number") {
				throw new Error("TargetIndex attribute at MovedElements element is no number");
			}
		});
	}

	async function completeSpecificChangeInfo(oModifier, mSpecificChangeInfo, oAppComponent) {
		delete mSpecificChangeInfo.source.publicAggregation;
		delete mSpecificChangeInfo.target.publicAggregation;

		const oSourceParent =
			mSpecificChangeInfo.source.parent || await oModifier.bySelector(mSpecificChangeInfo.source.id, oAppComponent);
		const oTargetParent =
			mSpecificChangeInfo.target.parent || await oModifier.bySelector(mSpecificChangeInfo.target.id, oAppComponent);
		var sSourceAggregation = mSpecificChangeInfo.source.aggregation;
		var sTargetAggregation = mSpecificChangeInfo.target.aggregation;
		var mAdditionalSourceInfo = {
			aggregation: mSpecificChangeInfo.source.aggregation,
			type: oModifier.getControlType(oSourceParent)
		};

		var mAdditionalTargetInfo = {
			aggregation: mSpecificChangeInfo.target.aggregation,
			type: oModifier.getControlType(oTargetParent)
		};

		var mSpecificInfo = {
			source: {
				id: oSourceParent.getId(),
				aggregation: sSourceAggregation,
				type: mAdditionalSourceInfo.type,
				selector: oModifier.getSelector(mSpecificChangeInfo.source.id, oAppComponent, mAdditionalSourceInfo)
			},
			target: {
				id: oTargetParent.getId(),
				aggregation: sTargetAggregation,
				type: mAdditionalTargetInfo.type,
				selector: oModifier.getSelector(mSpecificChangeInfo.target.id, oAppComponent, mAdditionalTargetInfo)
			},
			movedElements: mSpecificChangeInfo.movedElements
		};

		return mSpecificInfo;
	}

	/**
	 * Moves an element from one aggregation to another.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {string} [mPropertyBag.sourceAggregation] - name of the source aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {string} [mPropertyBag.targetAggregation] - name of the target aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComponent
	 * @return {Promise} Promise resolving if the change could be applied
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#applyChange
	 */
	MoveControls.applyChange = async function(oChange, oRelevantContainer, mPropertyBag) {
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;
		const oChangeContent = oChange.getContent();
		const aRevertData = [];
		let bChangeAlreadyPerformed = false;

		checkConditions(oChange, oModifier, oView, oAppComponent);
		for (const mMovedElement of oChangeContent.movedElements) {
			const oMovedElement = await getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);
			let oSourceParent = oModifier.getParent(oMovedElement);
			// mPropertyBag.sourceAggregation and mPropertyBag.targetAggregation should always be used when available
			let sSourceAggregation =
				mPropertyBag.sourceAggregation || await oModifier.getParentAggregationName(oMovedElement, oSourceParent);
			const oTargetParent = await oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
			const sTargetAggregation = mPropertyBag.targetAggregation || oChangeContent.target.selector.aggregation;
			// save the current index, sourceParent and sourceAggregation for revert
			let iSourceIndex = await oModifier.findIndexInParentAggregation(oMovedElement);
			const iInsertIndex = mMovedElement.targetIndex;
			if (iSourceIndex > -1) {
				// if iIndex === iInsertIndex and source===target the operation was already performed (e.g. drag&drop in RTA)
				// in this case we need the sourceIndex and sourceParent that is saved in the change in order to revert it
				// to the correct index and we can't use the current aggregations/parents
				if (
					iSourceIndex === iInsertIndex &&
					sSourceAggregation === sTargetAggregation &&
					oModifier.getParent(oMovedElement) === oTargetParent
				) {
					iSourceIndex = mMovedElement.sourceIndex;
					sSourceAggregation = mPropertyBag.sourceAggregation || oChangeContent.source.selector.aggregation;
					bChangeAlreadyPerformed = true;
					oSourceParent = await oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView) || oSourceParent;
				}
			}
			if (iSourceIndex > -1) {
				aRevertData.unshift({
					index: iSourceIndex,
					aggregation: sSourceAggregation,
					sourceParent: oModifier.getSelector(oSourceParent, oAppComponent)
				});
			}
			if (!bChangeAlreadyPerformed) {
				await oModifier.moveAggregation(
					oSourceParent,
					sSourceAggregation,
					oTargetParent,
					sTargetAggregation,
					oMovedElement,
					iInsertIndex,
					oView
				);
			}
		}
		oChange.setRevertData(aRevertData);
	};

	/**
	 * Reverts the Change MoveControls.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
	 * @return {Promise} Promise resolving when change was successfully reverted
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Reverter
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#revertChange
	 */
	MoveControls.revertChange = async function(oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		// we still have to set sourceParent and sourceAggregation initially from the change data,
		// because for XML changes this data can't be stored in the revertData yet.
		var oChangeContent = oChange.getContent();

		checkConditions(oChange, oModifier, oView, oAppComponent);
		let oSourceParent = await oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView);
		const oTargetParent = await oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
		let sSourceAggregation = oChangeContent.source.selector.aggregation;
		const sTargetAggregation = oChangeContent.target.selector.aggregation;
		const aRevertData = oChange.getRevertData();
		oChangeContent.movedElements.reverse();
		let iElementIndex = 0;
		for (const mMovedElement of oChangeContent.movedElements) {
			const oMovedElement = await getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);
			if (!oMovedElement) {
				throw new Error("Element to move not found");
			}
			let iInsertIndex = mMovedElement.sourceIndex;
			if (aRevertData) {
				var mRevertData = aRevertData[iElementIndex];
				sSourceAggregation = mRevertData.aggregation;
				iInsertIndex = mRevertData.index;
				oSourceParent = await oModifier.bySelector(mRevertData.sourceParent, oAppComponent, oView) || oSourceParent;
			}
			await oModifier.moveAggregation(
				oTargetParent,
				sTargetAggregation,
				oSourceParent,
				sSourceAggregation,
				oMovedElement,
				iInsertIndex,
				oView
			);
			iElementIndex++;
		}
		oChange.resetRevertData();
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object to be completed
	 * @param {object} mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag - map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @return {Promise} Promise resolving when all change content is completed
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#completeChangeContent
	 */
	MoveControls.completeChangeContent = async function(oChange, mSpecificChangeInfo, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;

		checkCompleteChangeContentConditions(mSpecificChangeInfo);
		const mCompleteSpecificChangeInfo = await completeSpecificChangeInfo(oModifier, mSpecificChangeInfo, oAppComponent);
		var oContent = {
			movedElements: [],
			source: {
				selector: mCompleteSpecificChangeInfo.source.selector
			},
			target: {
				selector: mCompleteSpecificChangeInfo.target.selector
			}
		};

		for (const mElement of mCompleteSpecificChangeInfo.movedElements) {
			const oElement = mElement.element || await oModifier.bySelector(mElement.id, oAppComponent);
			oContent.movedElements.push({
				selector: oModifier.getSelector(oElement, oAppComponent),
				sourceIndex: mElement.sourceIndex,
				targetIndex: mElement.targetIndex
			});
			oChange.addDependentControl(mCompleteSpecificChangeInfo.source.id, MoveControls.SOURCE_ALIAS, mPropertyBag);
			oChange.addDependentControl(mCompleteSpecificChangeInfo.target.id, MoveControls.TARGET_ALIAS, mPropertyBag);
			oChange.addDependentControl(mCompleteSpecificChangeInfo.movedElements.map(function(element) {
				return element.id;
			}), MoveControls.MOVED_ELEMENTS_ALIAS, mPropertyBag);
		}
		oChange.setContent(oContent);
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	MoveControls.getCondenserInfo = function(oChange) {
		var oChangeContent = oChange.getContent();
		var oRevertData = oChange.getRevertData()[0];
		return {
			affectedControl: oChangeContent.movedElements[0].selector,
			classification: CondenserClassification.Move,
			sourceContainer: oRevertData.sourceParent,
			targetContainer: oChangeContent.target.selector,
			sourceIndex: oRevertData.index,
			sourceAggregation: oRevertData.aggregation,
			targetAggregation: oChangeContent.target.selector.aggregation,
			setTargetIndex(oChange, iNewTargetIndex) {
				var oChangeContent = oChange.getContent();
				oChangeContent.movedElements[0].targetIndex = iNewTargetIndex;
				oChange.setContent(oChangeContent);
			},
			getTargetIndex(oChange) {
				return oChange.getContent().movedElements[0].targetIndex;
			},
			setIndexInRevertData(oChange, iIndex) {
				var aRevertData = oChange.getRevertData();
				aRevertData[0].index = iIndex;
				oChange.setRevertData(aRevertData);
			}
		};
	};

	MoveControls.getChangeVisualizationInfo = function(oChange) {
		var oChangeContent = oChange.getContent();
		var oRevertData = oChange.getRevertData()[0];
		return {
			affectedControls: [oChangeContent.movedElements[0].selector],
			dependentControls: [oChangeContent.source.selector],
			descriptionPayload: {
				sourceContainer: oRevertData.sourceParent,
				targetContainer: oChangeContent.target.selector
			}
		};
	};
	return MoveControls;
},
/* bExport= */true);
