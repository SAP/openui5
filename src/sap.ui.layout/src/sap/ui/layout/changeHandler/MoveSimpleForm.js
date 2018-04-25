/*!
 * ${copyright}
 */

sap.ui.define(["jquery.sap.global", "sap/ui/core/util/reflection/JsControlTreeModifier"],
		function(jQuery, JsControlTreeModifier) {
			"use strict";

			/**
			 * Change handler for moving elements.
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
			MoveSimpleForm.sTypeMTitle = "sap.m.Title";
			MoveSimpleForm.sTypeToolBar = "sap.m.Toolbar";
			MoveSimpleForm.sTypeOverflowToolBar = "sap.m.OverflowToolbar";
			MoveSimpleForm.sTypeLabel = "sap.m.Label";
			MoveSimpleForm.sTypeSmartLabel = "sap.ui.comp.smartfield.SmartLabel";
			MoveSimpleForm.CONTENT_AGGREGATION = "content";

			var fnFirstGroupWithoutTitle = function(oModifier, aStopToken, aContent) {
				for (var i = 0; i < aContent.length; i++) {
					var sType = oModifier.getControlType(aContent[i]);
					if (aStopToken.indexOf(sType) === -1) {
						if (oModifier.getVisible(aContent[i])) {
							return true;
						}
					} else {
						return false;
					}
				}
			};

			var fnAddTitleToFirstGroupIfNeeded = function(oModifier, aContent, oSimpleForm, mPropertyBag, aStopToken) {
				if (fnFirstGroupWithoutTitle(oModifier, aStopToken, aContent)) {
					var oView = mPropertyBag.view;
					var oAppComponent = mPropertyBag.appComponent;
					var sGroupId = oAppComponent.createId(jQuery.sap.uid());

					var oTitle = oModifier.createControl("sap.ui.core.Title", oAppComponent, oView, sGroupId);
					oModifier.setProperty(oTitle, "text", "");
					oModifier.insertAggregation(oSimpleForm, "content", oTitle, 0, oView);
				}

				return oModifier.getAggregation(oSimpleForm, "content");
			};

			var fnMapGroupIndexToContentAggregationIndex = function(oModifier, aStopToken, aContent, iGroupIndex) {
				var oResult;
				var iCurrentGroupIndex = -1;

				if (fnFirstGroupWithoutTitle(oModifier, aStopToken, aContent)) {
					iCurrentGroupIndex++;
				}

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

			var fnIsTitleOrToolbar = function(aElements, iIndex, oModifier) {
				if (iIndex >= aElements.length || iIndex === -1) {
					return true;
				}
				var sType = oModifier.getControlType(aElements[iIndex]);
				return (MoveSimpleForm.sTypeTitle === sType
						|| MoveSimpleForm.sTypeToolBar === sType
						|| MoveSimpleForm.sTypeMTitle === sType
						|| MoveSimpleForm.sTypeOverflowToolBar === sType);
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

			var fnGetFieldLength = function(oModifier, aElements, iIndex) {
				return fnMeasureLengthOfSequenceUntilStopToken(oModifier, iIndex, aElements,
					[MoveSimpleForm.sTypeTitle,
					MoveSimpleForm.sTypeMTitle,
					MoveSimpleForm.sTypeToolBar,
					MoveSimpleForm.sTypeOverflowToolBar,
					MoveSimpleForm.sTypeLabel,
					MoveSimpleForm.sTypeSmartLabel
					]);
			};

			var fnMapFieldIndexToContentAggregationIndex = function(oModifier, aContent, iGroupStart, iFieldIndex, bUp) {
				if (!fnIsTitleOrToolbar(aContent, iGroupStart, oModifier)) {
					jQuery.sap.log.error("Illegal argument. iIndex has to point to a Label.");
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
					return iAbsolutIndex;
				}
			};

			var fnArrayRangeCopy = function(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
				var aResult = aTarget;
				for (var i = 0; i < iMovedLength; i++) {
					aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
				}
				return aResult;
			};

			var fnGetGroupHeader = function(oHeader) {
				var oResult = oHeader.getTitle();
				if (!oResult) {
					oResult = oHeader.getToolbar();
				}
				return oResult;
			};

			var fnMoveFormContainer = function(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {
				var oMovedGroupTitle = fnGetGroupHeader(mMovedElement.element);
				var oSimpleFormSelector = JsControlTreeModifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
				var mMovedSimpleFormElement = {
					elementSelector : JsControlTreeModifier.getSelector(oMovedGroupTitle, mPropertyBag.appComponent),
					source : {
						groupIndex : mMovedElement.sourceIndex
					},
					target : {
						groupIndex : mMovedElement.targetIndex
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP,
					targetSelector : oSimpleFormSelector,
					movedControl : oMovedGroupTitle,
					movedElements : [mMovedSimpleFormElement]
				};

			};

			var fnMoveFormElement = function(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {
				var oSimpleFormSelector = JsControlTreeModifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
				var oLabel = mMovedElement.element.getLabel();
				var oLabelSelector = JsControlTreeModifier.getSelector(oLabel, mPropertyBag.appComponent);
				var oTargetGroupHeader = fnGetGroupHeader(oTarget.parent);
				var oSourceGroupHeader = fnGetGroupHeader(oSource.parent);
				var oTargetGroupSelector = JsControlTreeModifier.getSelector(oTargetGroupHeader, mPropertyBag.appComponent);
				var oSourceGroupSelector = JsControlTreeModifier.getSelector(oSourceGroupHeader, mPropertyBag.appComponent);

				var oMovedElement = {
					elementSelector : oLabelSelector,
					source : {
						groupSelector : oSourceGroupSelector,
						fieldIndex : mMovedElement.sourceIndex
					},
					target : {
						groupSelector : oTargetGroupSelector,
						fieldIndex : mMovedElement.targetIndex
					}
				};

				return {
					changeType : MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD,
					targetSelector : oSimpleFormSelector,
					target : oTargetGroupHeader,
					source : oSourceGroupHeader,
					movedControl : oLabel,
					movedElements : [oMovedElement]
				};
			};

			var fnRemoveAndInsertAggregation = function(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView) {
				oModifier.removeAllAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
				for (var i = 0; i < aContentClone.length; ++i) {
					oModifier.insertAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION, aContentClone[i], i, oView);
				}
			};

			/**
			 * Moves an element from one aggregation to another.
			 *
			 * @param {sap.ui.fl.Change} oChangeWrapper
			 *          change object with instructions to be applied on the control map
			 * @param {sap.ui.core.Control} oSimpleForm
			 *          oSourceParent control that matches the change selector for applying the change, which is the source of
			 *          the move
			 * @param {object} mPropertyBag
			 *          map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
			 *          sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
			 * @returns {boolean} true - if change could be applied
			 * @public
			 */
			MoveSimpleForm.applyChange = function(oChangeWrapper, oSimpleForm, mPropertyBag) {
				var oModifier = mPropertyBag.modifier;
				var oView = mPropertyBag.view;
				var oAppComponent = mPropertyBag.appComponent;
				var oTargetGroup, aContentClone;

				var oContent = oChangeWrapper.getContent();
				var mMovedElement = oContent.movedElements[0];
				var aContent = oModifier.getAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);

				if (oChangeWrapper.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {
					// !important : element was used in 1.40, do not remove for compatibility!
					var oSourceField = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
					var iSourceFieldIndex = aContent.indexOf(oSourceField);
					var iSourceFieldLength = fnGetFieldLength(oModifier, aContent, iSourceFieldIndex);

					// Compute the fields target index
					// !important : groupId was used in 1.40, do not remove for compatibility!
					oTargetGroup = oModifier.bySelector(mMovedElement.target.groupSelector || mMovedElement.target.groupId, oAppComponent, oView);
					var iTargetGroupIndex = aContent.indexOf(oTargetGroup);
					// !important : groupId was used in 1.40, do not remove for compatibility!
					var oSourceGroup = oModifier.bySelector(mMovedElement.source.groupSelector || mMovedElement.source.groupId, oAppComponent, oView);
					var iSourceGroupIndex = aContent.indexOf(oSourceGroup);

					var iTargetFieldIndex = fnMapFieldIndexToContentAggregationIndex(oModifier, aContent, iTargetGroupIndex,
							mMovedElement.target.fieldIndex, (iSourceGroupIndex === iTargetGroupIndex)
									&& (mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex));
					var iTargetFieldLength = fnGetFieldLength(oModifier, aContent, iTargetFieldIndex);

					aContentClone = aContent.slice();
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
						fnRemoveAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView);
					}

				} else if (oChangeWrapper.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP) {

					var aStopGroupToken = [MoveSimpleForm.sTypeTitle,
											MoveSimpleForm.sTypeToolBar,
											MoveSimpleForm.sTypeMTitle,
											MoveSimpleForm.sTypeOverflowToolBar];
					// !important : element was used in 1.40, do not remove for compatibility!
					var oMovedGroup = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);

					// If needed, insert a Title for the first group.
					if (mMovedElement.target.groupIndex === 0 || !oMovedGroup) {
						aContent = fnAddTitleToFirstGroupIfNeeded(oModifier, aContent, oSimpleForm, mPropertyBag, aStopGroupToken, oContent.newControlId);
					}

					var iMovedGroupIndex = oMovedGroup ? aContent.indexOf(oMovedGroup) : 0;

					var iTargetIndex = fnMapGroupIndexToContentAggregationIndex(oModifier, aStopGroupToken, aContent,
							mMovedElement.target.groupIndex);
					oTargetGroup = aContent[iTargetIndex];
					var iTargetLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iTargetIndex, aContent,
							aStopGroupToken);

					var iMovedLength = fnMeasureLengthOfSequenceUntilStopToken(oModifier, iMovedGroupIndex, aContent,
							aStopGroupToken);
					aContentClone = aContent.slice();
					// Cut the moved group from the result array...
					aContentClone.splice(iMovedGroupIndex, iMovedLength);

					iTargetIndex = aContentClone.indexOf(oTargetGroup);

					var iOffset = mMovedElement.source.groupIndex < mMovedElement.target.groupIndex ? iTargetLength : 0;
					// and insert it at the target index
					aContentClone = fnArrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex + iOffset, iMovedLength);

					fnRemoveAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView);
				} else {
					jQuery.sap.log.warning("Unknown change type detected. Cannot apply to SimpleForm");
				}

				return true;

			};

			/**
			 * Completes the change by adding change handler specific content
			 *
			 * @param {sap.ui.fl.Change}
			 *          oChangeWrapper change object to be completed
			 * @param {object}
			 *          mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
			 * @param {object}
			 *          mPropertyBag map containing the application component
			 * @public
			 */
			MoveSimpleForm.completeChangeContent = function(oChangeWrapper, mSpecificChangeInfo, mPropertyBag) {
				var mStableChangeInfo;

				var oModifier = mPropertyBag.modifier;
				var oView = mPropertyBag.view;
				var oAppComponent = mPropertyBag.appComponent;

				var oSimpleForm = oModifier.bySelector(mSpecificChangeInfo.selector, oAppComponent, oView);
				var aMovedElements = mSpecificChangeInfo.movedElements;
				if (aMovedElements.length > 1) {
					jQuery.sap.log.warning("Moving more than 1 Formelement is not yet supported.");
				}
				var mMovedElement = aMovedElements[0];
				mMovedElement.element = sap.ui.getCore().byId(mMovedElement.id);
				var oSource = jQuery.extend({}, mSpecificChangeInfo.source);
				var oTarget = jQuery.extend({}, mSpecificChangeInfo.target);
				if (!oTarget.parent) {
					oTarget.parent = sap.ui.getCore().byId(oTarget.id);
				}
				if (!oSource.parent) {
					oSource.parent = sap.ui.getCore().byId(oSource.id);
				}
				if (oSimpleForm && mMovedElement.element && oTarget.parent) {
					if (mSpecificChangeInfo.changeType === "moveSimpleFormGroup") {
						mStableChangeInfo = fnMoveFormContainer(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag);
					} else if (mSpecificChangeInfo.changeType === "moveSimpleFormField") {
						mStableChangeInfo = fnMoveFormElement(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag);
					}
				} else {
					jQuery.sap.log.error("Element not found. This may caused by an instable id!");
				}

				var mChangeData = oChangeWrapper.getDefinition();
				mChangeData.content.targetSelector = mStableChangeInfo.targetSelector;
				mChangeData.content.movedElements = mStableChangeInfo.movedElements;

				if (mStableChangeInfo.source && mStableChangeInfo.target){
					oChangeWrapper.addDependentControl(mStableChangeInfo.source, "sourceParent", mPropertyBag);
					oChangeWrapper.addDependentControl(mStableChangeInfo.target, "targetParent", mPropertyBag);
				}
				oChangeWrapper.addDependentControl([mStableChangeInfo.movedControl], "movedElements", mPropertyBag);
			};

			return MoveSimpleForm;
		},
		/* bExport= */true);
