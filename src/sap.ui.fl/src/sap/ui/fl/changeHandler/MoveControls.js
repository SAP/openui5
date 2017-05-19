/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "./Base", "sap/ui/fl/Utils"
    ], function(jQuery, Base, FlexUtils) {
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

		MoveControls.CHANGE_TYPE = "moveControls";

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

			return oModifier.bySelector(mMovedElement.selector || mMovedElement.id, oAppComponent, oView);
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
		 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier - modifier for the controls
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent - appComopnent
		 * @return {boolean} true - if change could be applied
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
			var oSourceParent = oModifier.bySelector(oChangeContent.source.selector, oAppComponent, oView);
			var oTargetParent = oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
			var sSourceAggregation = oChangeContent.source.selector.aggregation;
			var sTargetAggregation = oChangeContent.target.selector.aggregation;

			oChangeContent.movedElements.forEach(function(mMovedElement) {
				var oMovedElement = this._getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);

				if (!oMovedElement) {
					FlexUtils.log.warning("Element to move not found");
					return;
				}

				oModifier.removeAggregation(oSourceParent, sSourceAggregation, oMovedElement, oView);
				oModifier.insertAggregation(oTargetParent, sTargetAggregation, oMovedElement, mMovedElement.targetIndex);
			}, this);

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

			mChangeData.changeType = MoveControls.CHANGE_TYPE;
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
		};

		return MoveControls;
	},
/* bExport= */true);
