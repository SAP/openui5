/*!
 * ${copyright}
 */

sap.ui.define([], function() {
	"use strict";

	/**
	 * Change handler for moving of an elements.
	 *
	 * @alias sap.ui.fl.changeHandler.MoveElements
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.34.0
	 */
	var MoveElements = { };

	MoveElements.CHANGE_TYPE = "moveElements";

	function fnCheckConditions(oChange, oModifier, oView, oAppComponent) {
		if (!oChange) {
			throw new Error("No change instance");
		}

		var oChangeContent = oChange.getContent();

		if (!oChangeContent || !oChangeContent.movedElements || oChangeContent.movedElements.length === 0) {
			throw new Error("Change format invalid");
		}
		if (!oChange.getSelector().aggregation) {
			throw new Error("No source aggregation supplied via selector for move");
		}
		if (!oChangeContent.target || !oChangeContent.target.selector) {
			throw new Error("No target supplied for move");
		}
		if (!oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView)) {
			throw new Error("Move target parent not found");
		}
		if (!oChangeContent.target.selector.aggregation) {
			throw new Error("No target aggregation supplied for move");
		}
	}

	async function fnGetElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView) {
		if (!mMovedElement.selector && !mMovedElement.id) {
			throw new Error("Change format invalid - moveElements element has no id attribute");
		}
		if (typeof mMovedElement.targetIndex !== "number") {
			throw new Error(
				`Missing targetIndex for element with id '${mMovedElement.selector.id}' in movedElements supplied`
			);
		}

		return await oModifier.bySelector(mMovedElement.selector || mMovedElement.id, oAppComponent, oView);
	}

	/**
	 * Moves an element from one aggregation to another.
	 *
	 * @param {sap.ui.fl.apply._internal.flexObjects.FlexObject} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oSourceParent control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
	 * @return {Promise} Promise resolving when change has been applied
	 * @private
	 * @ui5-restricted sap.ui.fl.apply.changes.Applyer
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveElements#applyChange
	 */
	MoveElements.applyChange = async function(oChange, oSourceParent, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oChangeContent = oChange.getContent();

		fnCheckConditions(oChange, oModifier, oView, oAppComponent);
		const sSourceAggregation = oChange.getSelector().aggregation;
		const sTargetAggregation = oChangeContent.target.selector.aggregation;
		const oTargetParent = await oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
		for (const mMovedElement of oChangeContent.movedElements) {
			const oMovedElement = await fnGetElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);
			if (!oMovedElement) {
				throw new Error("Element to move not found");
			}
			await oModifier.moveAggregation(
				oSourceParent,
				sSourceAggregation,
				oTargetParent,
				sTargetAggregation,
				oMovedElement,
				mMovedElement.targetIndex,
				oView
			);
		}
	};

	/**
	 * Enrich the incoming change info with the change info from the setter, to get the complete data in one format
	 *
	 * @param {object} oModifier modifier object
	 * @param {object} mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @returns {object} MoveElements elements to move
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveElements#getSpecificChangeInfo
	 */
	MoveElements.getSpecificChangeInfo = function(oModifier, mSpecificChangeInfo) {
		var oSourceParent = mSpecificChangeInfo.source.parent || oModifier.bySelector(mSpecificChangeInfo.source.id);
		var oTargetParent = mSpecificChangeInfo.target.parent || oModifier.bySelector(mSpecificChangeInfo.target.id);
		var sSourceAggregation = mSpecificChangeInfo.source.aggregation;
		var sTargetAggregation = mSpecificChangeInfo.target.aggregation;

		var mSpecificInfo = {
			source: {
				id: oSourceParent.getId(),
				aggregation: sSourceAggregation,
				type: oModifier.getControlType(oSourceParent)
			},
			target: {
				id: oTargetParent.getId(),
				aggregation: sTargetAggregation,
				type: oModifier.getControlType(oTargetParent)
			},
			movedElements: mSpecificChangeInfo.movedElements
		};

		return mSpecificInfo;
	};

	return MoveElements;
},
/* bExport= */true);