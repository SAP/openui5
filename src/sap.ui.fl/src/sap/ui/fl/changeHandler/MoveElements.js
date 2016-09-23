/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "./Base", "sap/ui/fl/Utils", "sap/ui/fl/changeHandler/JsControlTreeModifier"
    ], function(jQuery, Base, FlexUtils, JsControlTreeModifier) {
		"use strict";

		/**
		 * Change handler for moving of a elements.
		 *
		 * @alias sap.ui.fl.changeHandler.MoveElements
		 * @author SAP SE
		 * @version ${version}
		 * @experimental Since 1.34.0
		 */
		var MoveElements = { };

		MoveElements.CHANGE_TYPE = "moveElements";

		/**
		 * Moves an element from one aggregation to another.
		 *
		 * @param {sap.ui.fl.Change} oChange change object with instructions to be applied on the control map
		 * @param {sap.ui.core.Control} oSourceParent control that matches the change selector for applying the change, which is the source of the move
		 * @param {object} mPropertyBag
		 * @param {object} mPropertyBag.view - xml node representing an ui5 view
		 * @param {sap.ui.fl.changeHandler.BaseTreeModifier} mPropertyBag.modifier
		 * @param {sap.ui.core.UIComponent} mPropertyBag.appComponent
		 * @public
		 * @function
		 * @name sap.ui.fl.changeHandler.MoveElements#applyChange
		 */
		MoveElements.applyChange = function(oChange, oSourceParent, mPropertyBag) {
			function checkConditions(oChange, oModifier, oView, oAppComponent) {
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

			function getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView) {
				if (!mMovedElement.selector && !mMovedElement.id) {
					throw new Error("Change format invalid - moveElements element has no id attribute");
				}
				if (typeof mMovedElement.targetIndex !== "number") {
					throw new Error("Missing targetIndex for element with id '" + mMovedElement.selector.id
							+ "' in movedElements supplied");
				}

				return oModifier.bySelector(mMovedElement.selector || mMovedElement.id, oAppComponent, oView);
			}

			var oModifier = mPropertyBag.modifier;
			var oView = mPropertyBag.view;
			var oAppComponent = mPropertyBag.appComponent;

			checkConditions(oChange, oModifier, oView, oAppComponent);

			var oChangeContent = oChange.getContent();
			var oTargetParent = oModifier.bySelector(oChangeContent.target.selector, oAppComponent, oView);
			var sSourceAggregation = oChange.getSelector().aggregation;
			var sTargetAggregation = oChangeContent.target.selector.aggregation;

			oChangeContent.movedElements.forEach(function(mMovedElement) {
				var oMovedElement = getElementControlOrThrowError(mMovedElement, oModifier, oAppComponent, oView);

				if (!oMovedElement) {
					FlexUtils.log.warning("Element to move not found");
					return;
				}

				oModifier.removeAggregation(oSourceParent, sSourceAggregation, oMovedElement, oView);
				oModifier.insertAggregation(oTargetParent, sTargetAggregation, oMovedElement, mMovedElement.targetIndex);
			});

			return true;
		};

		MoveElements.buildStableChangeInfo = function(mMoveActionParameter){
			delete mMoveActionParameter.source.publicAggregation;
			delete mMoveActionParameter.target.publicAggregation;
			return mMoveActionParameter;
		};

		/**
		 * Completes the change by adding change handler specific content
		 *
		 * @param {sap.ui.fl.Change} oChange change object to be completed
		 * @param {object} mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
		 * @param {object} mPropertyBag
		 * @param {sap.ui.core.UiComponent} mPropertyBag.appComponent component in which the change should be applied
		 * @public
		 * @function
		 * @name sap.ui.fl.changeHandler.MoveElements#completeChangeContent
		 */
		MoveElements.completeChangeContent = function(oChange, mSpecificChangeInfo, mPropertyBag) {
			function checkCompleteChangeContentConditions() {
				if (!mSpecificChangeInfo.movedElements) {
					throw new Error("mSpecificChangeInfo.movedElements attribute required");
				}
				if (mSpecificChangeInfo.movedElements.length === 0) {
					throw new Error("MovedElements array is empty");
				}

				mSpecificChangeInfo.movedElements.forEach(function (mElement) {
					if (!mElement.id) {
						throw new Error("MovedElements element has no id attribute");
					}
					if (typeof (mElement.sourceIndex) !== "number") {
						throw new Error("SourceIndex attribute at MovedElements element is no number");
					}
					if (typeof (mElement.targetIndex) !== "number") {
						throw new Error("TargetIndex attribute at MovedElements element is no number");
					}
				});
			}

			checkCompleteChangeContentConditions();

			var oAppComponent = mPropertyBag.appComponent;

			var mSpecificInfo = this.getSpecificChangeInfo(JsControlTreeModifier, mSpecificChangeInfo);
			var mAdditionalSelectorInfo = {
				aggregation: mSpecificInfo.source.aggregation,
				type: mSpecificInfo.source.type
			};
			var mChangeData = oChange.getDefinition();
			jQuery.extend(mChangeData.selector, mAdditionalSelectorInfo);

			var mAdditionalTargetInfo = {
				aggregation: mSpecificInfo.target.aggregation,
				type: mSpecificInfo.target.type
			};

			mChangeData.changeType = MoveElements.CHANGE_TYPE;
			mChangeData.content = {
				movedElements : [],
				target : {
					selector :JsControlTreeModifier.getSelector(mSpecificInfo.target.id, oAppComponent, mAdditionalTargetInfo)
				}
			};

			mSpecificInfo.movedElements.forEach(function(mElement) {
				var oElement = mElement.element || JsControlTreeModifier.bySelector(mElement.id, oAppComponent);

				mChangeData.content.movedElements.push({
					selector: JsControlTreeModifier.getSelector(oElement, oAppComponent),
					sourceIndex : mElement.sourceIndex,
					targetIndex : mElement.targetIndex
				});
			});
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
				source : {
					id : oSourceParent.getId(),
					aggregation : sSourceAggregation,
					type : oModifier.getControlType(oSourceParent)
				},
				target : {
					id : oTargetParent.getId(),
					aggregation : sTargetAggregation,
					type : oModifier.getControlType(oTargetParent)
				},
				movedElements : mSpecificChangeInfo.movedElements
			};

			return mSpecificInfo;
		};

		return MoveElements;
	},
/* bExport= */true);
