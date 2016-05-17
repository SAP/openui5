/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/fl/changeHandler/Base", "sap/ui/fl/Utils"],
		function(jQuery, Base, Utils) {
			"use strict";

			/**
			 * Change handler for moving of a elements.
			 *
			 * @alias sap.ui.fl.changeHandler.MoveElements
			 * @author SAP SE
			 * @version ${version}
			 * @experimental Since 1.34.0
			 */
			var MoveSimpleForm = {};

			MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD = "simpleFormMoveField";
			MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP = "simpleFormMoveGroup";
			MoveSimpleForm.sTypeTitle = "sap.ui.core.Title";
			MoveSimpleForm.sTypeToolBar = "sap.m.Toolbar";
			MoveSimpleForm.sTypeLabel = "sap.m.Label";

			/**
			 * Moves an element from one aggregation to another.
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChange change object with instructions to be applied on the control map
			 * @param {sap.ui.core.Control}
			 *          oSourceParent control that matches the change selector for applying the change, which is the source of
			 *          the move
			 * @public
			 */
			MoveSimpleForm.applyChange = function(oChange, oSourceParent, oModifier, oView) {

				var oContent = oChange.getContent();
				var mMovedElement = oContent.movedElements[0];
				var oSimpleForm = oModifier.byId(oContent.selector);
				var aContent = oModifier.getAggregation(oSimpleForm, mMovedElement.target.aggregation);

				if (oContent.changeType === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {

					var aStopFieldTokens = [MoveSimpleForm.sTypeTitle, MoveSimpleForm.sTypeToolBar, MoveSimpleForm.sTypeLabel];
					var oMovedField = oModifier.byId(mMovedElement.element);
					var iMovedFieldIndex = aContent.indexOf(oMovedField);
					var iMovedFieldLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iMovedFieldIndex, aContent,
							aStopFieldTokens);

					// Cut the moved field from the result array...
					var aContentClone = aContent.slice();
					//fnDebugOut("++++++++++++++++++Nach Kopie", aContentClone);

					aContentClone.splice(iMovedFieldIndex, iMovedFieldLength);
					//fnDebugOut("+++++++++++++++++Nach Ausschneiden", aContentClone);

					// Compute the fields target index in the cut array
					var oTargetGroup = oModifier.byId(mMovedElement.target.groupId);
					var iTargetGroupIndex = aContentClone.indexOf(oTargetGroup);

					var iOffset = mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex ? -1 : 0;
					var iTargetFieldIndex = fnMapFieldIndexToContentAggregationIndex(oModifier, aContentClone, iTargetGroupIndex,
							mMovedElement.target.fieldIndex + iOffset);
					var iTargetFieldLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iTargetFieldIndex, aContent,
							aStopFieldTokens);

					iOffset = mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex ? iTargetFieldLength : 0;
					// and insert it at the target index
					aContentClone = fnArrayRangeCopy(aContent, iMovedFieldIndex, aContentClone, iTargetFieldIndex + iOffset,
							iMovedFieldLength);
					//fnDebugOut("++++++++++++++++++++Nach rangeCopy", aContentClone);

					oModifier.removeAllAggregation(oSimpleForm, mMovedElement.target.aggregation);
					for (var i = 0; i < aContentClone.length; ++i) {
						oModifier.insertAggregation(oSimpleForm, mMovedElement.target.aggregation, aContentClone[i], i);
					}

				} else if (oContent.changeType === MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP) {

					var aStopGroupToken = [MoveSimpleForm.sTypeTitle, MoveSimpleForm.sTypeToolBar];
					var oMovedGroup = oModifier.byId(mMovedElement.element);
					var iMovedGroupIndex = aContent.indexOf(oMovedGroup);

					var iTargetIndex = fnMapGroupIndexToContentAggregationIndex(oModifier, MoveSimpleForm.sTypeTitle, aContent,
							mMovedElement.target.groupIndex);
					var oTargetGroup = aContent[iTargetIndex];
					var iTargetLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iTargetIndex, aContent,
							aStopGroupToken);

					var iMovedLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iMovedGroupIndex, aContent,
							aStopGroupToken);
					var aContentClone = aContent.slice();
					// Cut the moved group from the result array...
					aContentClone.splice(iMovedGroupIndex, iMovedLength);

					iTargetIndex = aContentClone.indexOf(oTargetGroup);

					var iOffset = mMovedElement.source.groupIndex < mMovedElement.target.groupIndex ? iTargetLength : 0;
					// and insert it at the target index
					aContentClone = fnArrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex + iOffset,
							iMovedLength);

					oModifier.removeAllAggregation(oSimpleForm, mMovedElement.target.aggregation);
					for (var i = 0; i < aContentClone.length; ++i) {
						oModifier.insertAggregation(oSimpleForm, mMovedElement.target.aggregation, aContentClone[i], i);
					}

				} else {
					jQuery.sap.log.warning("Unknown change type detected. Cannot apply to SimpleForm");
				}

				return true;

			};

//			var fnDebugOut = function(message, aContent) {
//				console.warn(">>>>>>> ");
//				console.warn(">>>>>>> " + message);
//				for (var i = 0; i < aContent.length; i++) {
//					if (aContent[i].getText) {
//						console.warn(">>>>>>> " + i + ": " + aContent[i].getText());
//					} else {
//						console.warn(">>>>>>> " + i + ": " + aContent[i].getMetadata().getName());
//					}
//				}
//			}

			/**
			 * Completes the change by adding change handler specific content
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChange change object to be completed
			 * @param {object}
			 *          mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
			 * @public
			 */
			MoveSimpleForm.completeChangeContent = function(oChange, mSpecificChangeInfo, oModifier) {
				var mSpecificInfo = this.getSpecificChangeInfo(oModifier, mSpecificChangeInfo);
				var mChangeData = oChange.getDefinition();
				mChangeData.selector = mSpecificInfo.selector;
				mChangeData.content = mSpecificInfo;
			};

			/**
			 * Enrich the incoming change info with the change info from the setter, to get the complete data in one format
			 */
			MoveSimpleForm.getSpecificChangeInfo = function(oModifier, mSpecificChangeInfo) {

				var oAction;
				var oSimpleForm = sap.ui.getCore().byId(mSpecificChangeInfo.semanticContainer);
				var aMovedElements = mSpecificChangeInfo.movedElements;
				if (aMovedElements.length > 1) {
					jQuery.sap.log.warning("Moving more than 1 Formelement is not yet supported.");
				}
				var oMovedElement = sap.ui.getCore().byId(aMovedElements[0].id);
				var oSource = jQuery.extend({}, mSpecificChangeInfo.source);
				var oTarget = jQuery.extend({}, mSpecificChangeInfo.target);
				if (!oTarget.parent) {
					oTarget.parent = sap.ui.getCore().byId(oTarget.id);
				}
				if (oSimpleForm && oMovedElement && oTarget.parent) {
					if (oMovedElement instanceof sap.ui.layout.form.FormContainer) {
						oAction = fnMoveFormContainer(oSimpleForm, oMovedElement, oSource, oTarget);
					} else if (oMovedElement instanceof sap.ui.layout.form.FormElement) {
						oAction = fnMoveFormElement(oSimpleForm, oMovedElement, oSource, oTarget);
					}
				} else {
					jQuery.sap.log.error("Element not found. This may caused by an instable id!");
				}

				// Build a reverse action, not necessary in flex context
				// var oReverseAction = jQuery.extend(true, {}, oAction);
				// oReverseAction.source.elements = fnGetAll(sap.ui.getCore().byId(oAction.target.parent), oAction);
				// this._setReverseAction(oReverseAction);

				// var oSourceParent = mSpecificChangeInfo.source.parent || oModifier.byId(mSpecificChangeInfo.source.id);
				// var oTargetParent = mSpecificChangeInfo.target.parent || oModifier.byId(mSpecificChangeInfo.target.id);
				// var sSourceAggregation = mSpecificChangeInfo.source.aggregation;
				// var sTargetAggregation = mSpecificChangeInfo.target.aggregation;

				var mSpecificInfo = oAction;

				return mSpecificInfo;
			};

			var fnMapGroupIndexToContentAggregationIndex = function(oModifier, sType, aContent, iGroupIndex) {
				var oResult;
				var iCurrentGroupIndex = -1;
				for (var i = 0; i < aContent.length; i++) {
					if (oModifier.getControlType(aContent[i]) === sType) {
						iCurrentGroupIndex++;
						if (iCurrentGroupIndex === iGroupIndex) {
							oResult = aContent[i];
							break;
						}
					}
				}
				return aContent.indexOf(oResult);
			};

			var fnMapFieldIndexToContentAggregationIndex = function(oModifier, aContent, iGroupStart, iFieldIndex) {
				var oResult;
				var iCurrentFieldIndex = -1;
				for (var i = iGroupStart; i < aContent.length; i++) {
					if (oModifier.getControlType(aContent[i]) === MoveSimpleForm.sTypeLabel) {
						iCurrentFieldIndex++;
						if (iCurrentFieldIndex === iFieldIndex) {
							oResult = aContent[i];
							break;
						}
					}
				}
				return aContent.indexOf(oResult);
			};

			var fnMeasureLengthOfSequenceUntilStopToken = function(oModifier, iMovedElementIndex, aContent, aStopToken) {
				var i = 0;
				for (i = iMovedElementIndex + 1; i < aContent.length; ++i) {
					var sType = oModifier.getControlType(aContent[i]);
					if (aStopToken.indexOf(sType) > -1) {
						break;
					}
				}
				return i - iMovedElementIndex;
			};

			var fnArrayRangeCopy = function(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
				var aResult = aTarget;
				for (var i = 0; i < iMovedLength; i++) {
					aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
				}
				return aResult;
			};

			var fnMoveFormContainer = function(oSimpleForm, oMovedElement, oSource, oTarget) {

				var oMovedGroupTitle = oMovedElement.getTitle();
				var sSimpeFormId = oSimpleForm.getId();
				var oMovedElement = {
					element : oMovedGroupTitle.getId(),
					source : {
						aggregation : 'content',
						groupIndex : oSource.index
					},
					target : {
						aggregation : 'content',
						groupIndex : oTarget.index
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP,
					selector : sSimpeFormId,
					target : sSimpeFormId,
					movedElements : [oMovedElement]
				};

			};

			var fnMoveFormElement = function(oSimpleForm, oMovedElement, oSource, oTarget) {

				var sSimpeFormId = oSimpleForm.getId();
				var sLabelId = oMovedElement.getLabel().getId();
				var sTitleId = oTarget.parent.getTitle().getId();

				var oMovedElement = {
					element : sLabelId,
					source : {
						aggregation : 'content',
						groupId : sTitleId,
						fieldIndex : oSource.index
					},
					target : {
						aggregation : 'content',
						groupId : sTitleId,
						fieldIndex : oTarget.index
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD,
					selector : sSimpeFormId,
					target : sSimpeFormId,
					movedElements : [oMovedElement]
				};

			};

			// var fnExChangeContent = function(oAction) {
			// var oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
			// fnRemoveAll(oTargetParent, oAction);
			// fnAddAll(oTargetParent, oAction);
			// };
			//
			// // swap action with its reverse action, so a client can always get the actual action by calling 'getAction'
			// var fnSwapAction = function(oContext) {
			// var oTmp = oContext._getReverseAction();
			// oContext._setReverseAction(oContext.getAction());
			// oContext.setAction(oTmp);
			// };

			return MoveSimpleForm;
		},
		/* bExport= */true);
