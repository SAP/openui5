/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/base/Log"
],
function(
	Log
) {
	"use strict";

	/**
	 * Change handler for moving of an element.
	 *
	 * @alias sap.ui.fl.changeHandler.MoveControls
	 * @author SAP SE
	 * @version ${version}
	 * @experimental Since 1.46
	 */
	var MoveControls = { };

	// Defines object which contains constants used in the handler
	MoveControls.SOURCE_ALIAS = "source";
	MoveControls.TARGET_ALIAS = "target";
	MoveControls.MOVED_ELEMENTS_ALIAS = "movedElements";


	MoveControls._checkConditions = function (oChange, oModifier, oView, oAppComponent) {
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
	};

	MoveControls._getElementControlOrThrowError = function(mMovedElement, oModifier, oAppComponent, oView) {
		if (!mMovedElement.selector && !mMovedElement.id) {
			throw new Error("Change format invalid - moveElements element has no id attribute");
		}
		if (typeof mMovedElement.targetIndex !== "number") {
			throw new Error("Missing targetIndex for element with id '" + mMovedElement.selector.id
					+ "' in movedElements supplied");
		}
		var oControl = oModifier.bySelector(mMovedElement.selector || mMovedElement.id, oAppComponent, oView);

		if (!oControl) {
			throw new Error("Control to move was not found. Id: '" + mMovedElement.selector.id + "'");
		}
		return oControl;
	};

	MoveControls._checkCompleteChangeContentConditions = function(mSpecificChangeInfo) {
		if (!mSpecificChangeInfo.movedElements) {
			throw new Error("mSpecificChangeInfo.movedElements attribute required");
		}
		if (mSpecificChangeInfo.movedElements.length === 0) {
			throw new Error("MovedElements array is empty");
		}

		mSpecificChangeInfo.movedElements.forEach(function (mElement) {
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
	};

	MoveControls._getSpecificChangeInfo = function(oModifier, mSpecificChangeInfo, oAppComponent) {
		delete mSpecificChangeInfo.source.publicAggregation;
		delete mSpecificChangeInfo.target.publicAggregation;

		var oSourceParent = mSpecificChangeInfo.source.parent || oModifier.bySelector(mSpecificChangeInfo.source.id, oAppComponent);
		var oTargetParent = mSpecificChangeInfo.target.parent || oModifier.bySelector(mSpecificChangeInfo.target.id, oAppComponent);
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
			source : {
				id : oSourceParent.getId(),
				aggregation : sSourceAggregation,
				type : mAdditionalSourceInfo.type,
				selector : oModifier.getSelector(mSpecificChangeInfo.source.id, oAppComponent, mAdditionalSourceInfo)
			},
			target : {
				id : oTargetParent.getId(),
				aggregation : sTargetAggregation,
				type : mAdditionalTargetInfo.type,
				selector : oModifier.getSelector(mSpecificChangeInfo.target.id, oAppComponent, mAdditionalTargetInfo)
			},
			movedElements : mSpecificChangeInfo.movedElements
		};

		return mSpecificInfo;
	};

	/**
	 * Moves an element from one aggregation to another.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {string} [mPropertyBag.sourceAggregation] - name of the source aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {string} [mPropertyBag.targetAggregation] - name of the target aggregation. Overwrites the aggregation from the change. Can be provided by a custom ChangeHandler, that uses this ChangeHandler
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
	 * @return {boolean} Returns true if change could be applied, otherwise undefined
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#applyChange
	 */
	MoveControls.applyChange = function(oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		this._checkConditions(oChange, oModifier, oView, oAppComponent);

		var oChangeContent = oChange.getContent();
		// mPropertyBag.sourceAggregation and targetAggregation should always be used when available
		var sSourceAggregation = mPropertyBag.sourceAggregation || oChangeContent.source.selector.aggregation;
		var sTargetAggregation = mPropertyBag.targetAggregation || oChangeContent.target.selector.aggregation;
		var oSourceParent = oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView);
		var oTargetParent = oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);

		var aRevertData = [];
		oChangeContent.movedElements.forEach(function(mMovedElement) {
			var oMovedElement = this._getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);

			// save the current index, sourceParent and sourceAggregation for revert
			var iIndex = oModifier.findIndexInParentAggregation(oMovedElement);
			var iInsertIndex = mMovedElement.targetIndex;

			if (iIndex > -1) {
				// if iIndex === iInsertIndex the operation was already performed (e.g. drag&drop in RTA)
				// in this case we need the sourceIndex and sourceParent that is saved in the change in order to revert it to the correct index
				// and we can't use the current aggregations/parents
				if (iIndex === iInsertIndex) {
					iIndex = mMovedElement.sourceIndex;
				} else {
					sSourceAggregation = mPropertyBag.sourceAggregation || oModifier.getParentAggregationName(oMovedElement, oSourceParent);
					oSourceParent = oModifier.getParent(oMovedElement);
				}

				aRevertData.unshift({
					index: iIndex,
					aggregation: sSourceAggregation,
					sourceParent: oModifier.getSelector(oSourceParent, oAppComponent)
				});
			}

			oModifier.removeAggregation(oSourceParent, sSourceAggregation, oMovedElement);
			oModifier.insertAggregation(oTargetParent, sTargetAggregation, oMovedElement, iInsertIndex, oView);
		}, this);

		oChange.setRevertData(aRevertData);

		return true;
	};

	/**
	 * Reverts the Change MoveControls.
	 *
	 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oRelevantContainer control that matches the change selector for applying the change, which is the source of the move
	 * @param {object} mPropertyBag - map of properties
	 * @param {object} mPropertyBag.view - xml node representing a ui5 view
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
	 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
	 * @return {boolean} true - if change could be applied
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#revertChange
	 */
	MoveControls.revertChange = function(oChange, oRelevantContainer, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		this._checkConditions(oChange, oModifier, oView, oAppComponent);

		// we still have to set sourceParent and sourceAggregation initially from the change data,
		// because for XML changes this data can't be stored in the revertData yet.
		var oChangeContent = oChange.getContent();
		var oSourceParent = oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView);
		var sSourceAggregation = oChangeContent.source.selector.aggregation;
		var oTargetParent = oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
		var sTargetAggregation = oChangeContent.target.selector.aggregation;

		var aRevertData = oChange.getRevertData();
		oChange.getContent().movedElements.reverse();
		oChangeContent.movedElements.forEach(function(mMovedElement, iElementIndex) {
			var oMovedElement = this._getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);
			if (!oMovedElement) {
				Log.warning("Element to move not found");
				return;
			}

			var iInsertIndex = mMovedElement.sourceIndex;
			if (aRevertData) {
				var mRevertData = aRevertData[iElementIndex];
				sSourceAggregation = mRevertData.aggregation;
				iInsertIndex = mRevertData.index;
				oSourceParent = oModifier.bySelector(mRevertData.sourceParent, oAppComponent, oView);
			}

			oModifier.removeAggregation(oTargetParent, sTargetAggregation, oMovedElement);
			oModifier.insertAggregation(oSourceParent, sSourceAggregation, oMovedElement, iInsertIndex, oView);
		}, this);

		oChange.resetRevertData();

		return true;
	};

	/**
	 * Completes the change by adding change handler specific content.
	 *
	 * @param {sap.ui.fl.Change} oChange change object to be completed
	 * @param {object} mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object} mPropertyBag - map of properties
	 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
	 * @public
	 * @function
	 * @name sap.ui.fl.changeHandler.MoveControls#completeChangeContent
	 */
	MoveControls.completeChangeContent = function(oChange, mSpecificChangeInfo, mPropertyBag) {
		this._checkCompleteChangeContentConditions(mSpecificChangeInfo);

		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var mChangeData = oChange.getDefinition();

		mSpecificChangeInfo = this._getSpecificChangeInfo(oModifier, mSpecificChangeInfo, oAppComponent);

		mChangeData.content = {
			movedElements : [],
			source : {
				selector : mSpecificChangeInfo.source.selector
			},
			target : {
				selector : mSpecificChangeInfo.target.selector
			}
		};

		mSpecificChangeInfo.movedElements.forEach(function(mElement) {
			var oElement = mElement.element || oModifier.bySelector(mElement.id, oAppComponent);

			mChangeData.content.movedElements.push({
				selector: oModifier.getSelector(oElement, oAppComponent),
				sourceIndex : mElement.sourceIndex,
				targetIndex : mElement.targetIndex
			});
		});

		oChange.addDependentControl(mSpecificChangeInfo.source.id, MoveControls.SOURCE_ALIAS, mPropertyBag);
		oChange.addDependentControl(mSpecificChangeInfo.target.id, MoveControls.TARGET_ALIAS, mPropertyBag);
		oChange.addDependentControl(mSpecificChangeInfo.movedElements.map(function (element) {
			return element.id;
		}), MoveControls.MOVED_ELEMENTS_ALIAS, mPropertyBag);
	};

	/**
	 * Retrieves the condenser-specific information.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @returns {object} - Condenser-specific information
	 * @public
	 */
	MoveControls.getCondenserInfo = function(oChange) {
		var oChangeContent = oChange.getContent();
		var oRevertData = oChange.getRevertData()[0];
		return {
			affectedControl: oChangeContent.movedElements[0].selector,
			classification: sap.ui.fl.condenser.Classification.Move,
			sourceContainer: oRevertData.sourceParent,
			targetContainer: oChangeContent.target.selector,
			sourceIndex: oRevertData.index,
			sourceAggregation: oRevertData.aggregation,
			targetAggregation: oChangeContent.target.selector.aggregation,
			setTargetIndex: function(oChange, iNewTargetIndex) {
				oChange.getContent().movedElements[0].targetIndex = iNewTargetIndex;
			},
			getTargetIndex: function(oChange) {
				return oChange.getContent().movedElements[0].targetIndex;
			}
		};
	};
	return MoveControls;
},
/* bExport= */true);
