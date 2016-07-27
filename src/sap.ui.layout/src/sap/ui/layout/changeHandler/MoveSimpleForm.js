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

			MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD = "moveSimpleFormField";
			MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP = "moveSimpleFormGroup";
			MoveSimpleForm.sTypeTitle = "sap.ui.core.Title";
			MoveSimpleForm.sTypeToolBar = "sap.m.Toolbar";
			MoveSimpleForm.sTypeLabel = "sap.m.Label";
			MoveSimpleForm.CONTENT_AGGREGATION = "content";

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
				var oSimpleForm = oModifier.byId(oContent.selector.id);
				var aContent = oModifier.getAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);

				if (oContent.changeType === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {

					var oSourceField = oModifier.byId(mMovedElement.element);
					var iSourceFieldIndex = aContent.indexOf(oSourceField);
					var iSourceFieldLength = fnGetFieldLength(oModifier, aContent, iSourceFieldIndex);

					// Compute the fields target index
					var oTargetGroup = oModifier.byId(mMovedElement.target.groupId);
					var iTargetGroupIndex = aContent.indexOf(oTargetGroup);
					var oSourceGroup = oModifier.byId(mMovedElement.source.groupId);
					var iSourceGroupIndex = aContent.indexOf(oSourceGroup);

					var iTargetFieldIndex = fnMapFieldIndexToContentAggregationIndex(oModifier, aContent, iTargetGroupIndex,
							mMovedElement.target.fieldIndex, (iSourceGroupIndex === iTargetGroupIndex)
									&& (mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex));
					var iTargetFieldLength = fnGetFieldLength(oModifier, aContent, iTargetFieldIndex);

					var aContentClone = aContent.slice();
					var aFieldElements = aContentClone.slice(iSourceFieldIndex, iSourceFieldIndex + iSourceFieldLength);

					var aSegmentBeforeSource, aSegmentBeforeTarget, aSegmentBetweenSourceAndTarget, aSegmentTillEnd;
					if (iSourceFieldIndex < iTargetFieldIndex) {
						aSegmentBeforeSource = aContentClone.slice(0, iSourceFieldIndex);
						aSegmentBetweenSourceAndTarget = aContentClone.slice(iSourceFieldIndex + iSourceFieldLength, iTargetFieldIndex
								+ iTargetFieldLength);
						aSegmentTillEnd = aContentClone.slice(iTargetFieldIndex + iTargetFieldLength, aContentClone.length);
						aContentClone = aSegmentBeforeSource.concat(aSegmentBetweenSourceAndTarget.concat(aFieldElements.concat(aSegmentTillEnd)));
					} else if (iSourceFieldIndex > iTargetFieldIndex) {
						aSegmentBeforeTarget = aContentClone.slice(0, iTargetFieldIndex + iTargetFieldLength);
						aSegmentBetweenSourceAndTarget = aContentClone.slice(iTargetFieldIndex + iTargetFieldLength, iSourceFieldIndex);
						aSegmentTillEnd = aContentClone.slice(iSourceFieldIndex + iSourceFieldLength, aContentClone.length);
						aContentClone = aSegmentBeforeTarget.concat(aFieldElements.concat(aSegmentBetweenSourceAndTarget.concat(aSegmentTillEnd)));
					}

					if (iSourceFieldIndex != iTargetFieldIndex) {
						oModifier.removeAllAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
						for (var i = 0; i < aContentClone.length; ++i) {
							oModifier.insertAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION, aContentClone[i], i);
						}
					}

				} else if (oContent.changeType === MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP) {

					var aStopGroupToken = [MoveSimpleForm.sTypeTitle, MoveSimpleForm.sTypeToolBar];
					var oMovedGroup = oModifier.byId(mMovedElement.element);
					var iMovedGroupIndex = aContent.indexOf(oMovedGroup);

					var iTargetIndex = fnMapGroupIndexToContentAggregationIndex(oModifier, aStopGroupToken, aContent,
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

					oModifier.removeAllAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
					for (var i = 0; i < aContentClone.length; ++i) {
						oModifier.insertAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION, aContentClone[i], i);
					}

				} else {
					jQuery.sap.log.warning("Unknown change type detected. Cannot apply to SimpleForm");
				}

				return true;

			};

			/**
			 * Computes the inverse of a change
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChange change object with instructions to be applied on the control map
			 * @param {sap.ui.core.Control}
			 *          oSourceParent control that matches the change selector for applying the change, which is the source of
			 *          the move
			 * @public
			 */
			MoveSimpleForm.getInverseChange = function(oChange, oSourceParent, oModifier, oView) {
				return fnGetInverseChangeFromChange(oChange);
			};

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
				if (!oSource.parent) {
					oSource.parent = sap.ui.getCore().byId(oSource.id);
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
				return oAction;

			};

			var fnGetInverseChangeFromChange = function(oChange) {

				var oReverseChange = jQuery.extend(true, {}, oChange);
				var oReverseChangeContent = oReverseChange.getContent();
				oReverseChangeContent.movedElements.map(function(oMovedElement, iIndex) {
					var oTmp = jQuery.extend(true, {}, oMovedElement.source);
					oMovedElement.source = oMovedElement.target;
					oMovedElement.target = oTmp;
					return oMovedElement;
				});
				return oReverseChange;

			};

			var fnMapGroupIndexToContentAggregationIndex = function(oModifier, aStopToken, aContent, iGroupIndex) {
				var oResult;
				var iCurrentGroupIndex = -1;
				for (var i = 0; i < aContent.length; i++) {
					var sType = oModifier.getControlType(aContent[i]);
					if (aStopToken.indexOf(sType) > -1) {
						iCurrentGroupIndex++;
						if (iCurrentGroupIndex === iGroupIndex) {
							oResult = aContent[i];
							break;
						}
					}
				}
				return aContent.indexOf(oResult);
			};

			var fnIsTitleOrToolbar = function(aElements, iIndex) {
				if (iIndex >= aElements.length) {
					return true;
				}
				var sType = aElements[iIndex].getMetadata().getName();
				return (MoveSimpleForm.sTypeTitle === sType || MoveSimpleForm.sTypeToolBar === sType);
			};

			var fnGetFieldLength = function(oModifier, aElements, iIndex) {
				return fnMeasureLengthOfSequenceUntilStopToken(oModifier, iIndex, aElements, [MoveSimpleForm.sTypeTitle,
						MoveSimpleForm.sTypeToolBar, MoveSimpleForm.sTypeLabel]);
			};

			var fnMapFieldIndexToContentAggregationIndex = function(oModifier, aContent, iGroupStart, iFieldIndex, bUp) {
				if (!fnIsTitleOrToolbar(aContent, iGroupStart)) {
					jQuery.sap.log.error("Illegal argument. iIndex has to point to a title or toolbar");
				} else {
					iFieldIndex = bUp ? iFieldIndex + 1 : iFieldIndex;
					var iCurrentRelativeFieldIndex = 0;
					var iAbsolutIndex = iGroupStart;
					var iActLength;
					while (iAbsolutIndex < aContent.length && iCurrentRelativeFieldIndex < iFieldIndex) {
						++iCurrentRelativeFieldIndex;
						iActLength = fnGetFieldLength(oModifier, aContent, iAbsolutIndex);
						iAbsolutIndex += iActLength;
					}
				}
				return iAbsolutIndex;
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

				var oMovedGroupTitle = fnGetGroupHeader(oMovedElement);
				var sSimpeFormId = oSimpleForm.getId();
				var oMovedElement = {
					element : oMovedGroupTitle.getId(),
					source : {
						groupIndex : oSource.index
					},
					target : {
						groupIndex : oTarget.index
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP,
					selector : {
						id : sSimpeFormId
					},
					target : sSimpeFormId,
					movedElements : [oMovedElement]
				};

			};

			var fnGetGroupHeader = function(oHeader) {
				var oResult = oHeader.getTitle();
				if (!oResult) {
					oResult = oHeader.getToolbar();
				}
				return oResult;
			};

			var fnMoveFormElement = function(oSimpleForm, oMovedElement, oSource, oTarget) {

				var sSimpeFormId = oSimpleForm.getId();
				var sLabelId = oMovedElement.getLabel().getId();
				var oTargetGroupHeader = fnGetGroupHeader(oTarget.parent);
				var oSourceGroupHeader = fnGetGroupHeader(oSource.parent);
				var sTargetGroupId = oTargetGroupHeader.getId();
				var sSourceGroupId = oSourceGroupHeader.getId();

				var oMovedElement = {
					element : sLabelId,
					source : {
						groupId : sSourceGroupId,
						fieldIndex : oSource.index
					},
					target : {
						groupId : sTargetGroupId,
						fieldIndex : oTarget.index
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD,
					selector : {
						id : sSimpeFormId
					},
					target : sSimpeFormId,
					movedElements : [oMovedElement]
				};

			};

			return MoveSimpleForm;
		},
		/* bExport= */true);