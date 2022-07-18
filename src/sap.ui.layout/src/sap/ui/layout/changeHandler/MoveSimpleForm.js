/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/uid",
	"sap/base/Log"
], function(
	JsControlTreeModifier,
	uid,
	Log
) {
	"use strict";

	/**
	 * Change handler for moving elements inside SimpleForm
	 *
	 * @alias sap.ui.layout.changeHandler.MoveSimpleForm
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

	function firstGroupWithoutTitle(oModifier, aStopToken, aContent) {
		return aContent.reduce(function(oPreviousPromise, oContent){
			return oPreviousPromise
				.then(function(bReturnValue){
					if (bReturnValue !== undefined) {
						return bReturnValue;
					}
					var sType = oModifier.getControlType(oContent);
					if (aStopToken.indexOf(sType) === -1) {
						return Promise.resolve()
							.then(oModifier.getVisible.bind(oModifier, oContent))
							.then(function(bVisible){
								return bVisible || undefined;
							});
					} else {
						return false;
					}
				});
		}, Promise.resolve());
	}

	function addTitleToFirstGroupIfNeeded(oChange, oModifier, aContent, oSimpleForm, mPropertyBag, aStopToken, oGroupSelector) {
		return firstGroupWithoutTitle(oModifier, aStopToken, aContent)
			.then(function(bFirstGroupWithoutName){
				if (bFirstGroupWithoutName) {
					var oView = mPropertyBag.view;
					var oAppComponent = mPropertyBag.appComponent;
					var oTitle;
					return Promise.resolve()
						.then(oModifier.createControl.bind(oModifier, "sap.ui.core.Title", oAppComponent, oView, oGroupSelector))
						.then(function(oCreatedTitle){
							oTitle = oCreatedTitle;
							oModifier.setProperty(oTitle, "text", "");
							return oModifier.insertAggregation(oSimpleForm, "content", oTitle, 0, oView);
						})
						.then(function() {
							var oNewRevertData = oChange.getRevertData();
							oNewRevertData.createdTitleSelector = mPropertyBag.modifier.getSelector(oTitle, mPropertyBag.appComponent);
							oChange.setRevertData(oNewRevertData);
						});
				}
				return Promise.resolve();
			})
			.then(function(){
				return oModifier.getAggregation(oSimpleForm, "content");
			});
	}

	function mapGroupIndexToContentAggregationIndex(oModifier, aStopToken, aContent, iGroupIndex) {
		var oResult;
		var iCurrentGroupIndex = -1;

		return firstGroupWithoutTitle(oModifier, aStopToken, aContent)
			.then(function(bFirstGroupWithoutName){
				if (bFirstGroupWithoutName) {
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
			});
	}

	function isTitleOrToolbar(aElements, iIndex, oModifier) {
		if (iIndex >= aElements.length || iIndex === -1) {
			return true;
		}
		var sType = oModifier.getControlType(aElements[iIndex]);
		return (
			MoveSimpleForm.sTypeTitle === sType
				|| MoveSimpleForm.sTypeToolBar === sType
				|| MoveSimpleForm.sTypeMTitle === sType
				|| MoveSimpleForm.sTypeOverflowToolBar === sType
		);
	}

	function measureLengthOfSequenceUntilStopToken(oModifier, iMovedElementIndex, aContent, aStopToken) {
		var i = 0;
		for (i = iMovedElementIndex + 1; i < aContent.length; ++i) {
			var sType = oModifier.getControlType(aContent[i]);
			if (aStopToken.indexOf(sType) > -1) {
				break;
			}
		}
		return i - iMovedElementIndex;
	}

	function getFieldLength(oModifier, aElements, iIndex) {
		return measureLengthOfSequenceUntilStopToken(oModifier, iIndex, aElements,
			[
				MoveSimpleForm.sTypeTitle,
				MoveSimpleForm.sTypeMTitle,
				MoveSimpleForm.sTypeToolBar,
				MoveSimpleForm.sTypeOverflowToolBar,
				MoveSimpleForm.sTypeLabel,
				MoveSimpleForm.sTypeSmartLabel
			]
		);
	}

	function mapFieldIndexToContentAggregationIndex(oModifier, aContent, iGroupStart, iFieldIndex, bUp) {
		if (!isTitleOrToolbar(aContent, iGroupStart, oModifier)) {
			Log.error("Illegal argument. iIndex has to point to a Label.");
		} else {
			iFieldIndex = bUp ? iFieldIndex + 1 : iFieldIndex;
			var iCurrentRelativeFieldIndex = 0;
			var iAbsolutIndex = iGroupStart;
			var iActLength;
			while (iAbsolutIndex < aContent.length && iCurrentRelativeFieldIndex < iFieldIndex) {
				++iCurrentRelativeFieldIndex;
				iActLength = getFieldLength(oModifier, aContent, iAbsolutIndex);
				iAbsolutIndex += iActLength;
			}
			return iAbsolutIndex;
		}
	}

	function arrayRangeCopy(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
		var aResult = aTarget;
		for (var i = 0; i < iMovedLength; i++) {
			aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
		}
		return aResult;
	}

	function getGroupHeader(oHeader) {
		var oResult = oHeader.getTitle();
		if (!oResult) {
			oResult = oHeader.getToolbar();
		}
		return oResult;
	}

	function moveFormContainer(oSimpleForm, mMovedElement, mPropertyBag) {
		var oMovedGroupTitle = getGroupHeader(mMovedElement.element);
		var oSimpleFormSelector = mPropertyBag.modifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
		var mMovedSimpleFormElement = {
			elementSelector: mPropertyBag.modifier.getSelector(oMovedGroupTitle, mPropertyBag.appComponent),
			source: {
				groupIndex: mMovedElement.sourceIndex
			},
			target: {
				groupIndex: mMovedElement.targetIndex
			}
		};

		return {
			changeType: MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP,
			targetSelector: oSimpleFormSelector,
			movedControl: oMovedGroupTitle,
			movedElements: [mMovedSimpleFormElement]
		};
	}

	function moveFormElement(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {
		var oSimpleFormSelector = mPropertyBag.modifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
		var oLabel = mMovedElement.element.getLabel();
		var oLabelSelector = mPropertyBag.modifier.getSelector(oLabel, mPropertyBag.appComponent);
		var oTargetGroupHeader = getGroupHeader(oTarget.parent);
		var oSourceGroupHeader = getGroupHeader(oSource.parent);
		var oTargetGroupSelector = mPropertyBag.modifier.getSelector(oTargetGroupHeader, mPropertyBag.appComponent);
		var oSourceGroupSelector = mPropertyBag.modifier.getSelector(oSourceGroupHeader, mPropertyBag.appComponent);

		var oMovedElement = {
			elementSelector: oLabelSelector,
			source: {
				groupSelector: oSourceGroupSelector,
				fieldIndex: mMovedElement.sourceIndex
			},
			target: {
				groupSelector: oTargetGroupSelector,
				fieldIndex: mMovedElement.targetIndex
			}
		};

		return {
			changeType: MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD,
			targetSelector: oSimpleFormSelector,
			target: oTargetGroupHeader,
			source: oSourceGroupHeader,
			movedControl: oLabel,
			movedElements: [oMovedElement]
		};
	}

	function removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView) {
		return Promise.resolve()
			.then(oModifier.removeAllAggregation.bind(oModifier, oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION))
			.then(function(){
				return aContentClone.reduce(function(oPreviousPromise, oContentClone, iIndex) {
					return oPreviousPromise
						.then(oModifier.insertAggregation.bind(oModifier,
							oSimpleForm,
							MoveSimpleForm.CONTENT_AGGREGATION,
							oContentClone,
							iIndex,
							oView));
				}, Promise.resolve());
			});
	}

	/**
	 * Moves an element from one aggregation to another
	 *
	 * @param {sap.ui.fl.Change} oChange
	 *          Change object with instructions to be applied to the control map
	 * @param {sap.ui.core.Control} oSimpleForm
	 *          oSourceParent control that matches the change selector for applying the change, which is the source of
	 *          the move
	 * @param {object} mPropertyBag
	 *          Map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
	 *          sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
	 * @returns {Promise} Promise resolving when change is applied successfully
	 * @public
	 */
	MoveSimpleForm.applyChange = function(oChange, oSimpleForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;
		var oTargetGroup;
		var aContentClone;
		var iMovedGroupIndex;

		var oContent = oChange.getContent();
		var mMovedElement = oContent.movedElements[0];
		return Promise.resolve()
			.then(function(){
				return oModifier.getAggregation(oSimpleForm, MoveSimpleForm.CONTENT_AGGREGATION);
			})
			.then(function(aContent){
				var aContentSelectors = aContent.map(function(oContentControl) {
					return oModifier.getSelector(oContentControl, oAppComponent);
				});
				var mState = {content: aContentSelectors};
				oChange.setRevertData(mState);

				if (oChange.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {
					// !important: element was used in 1.40, do not remove for compatibility!
					var oSourceField = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
					var iSourceFieldIndex = aContent.indexOf(oSourceField);
					var iSourceFieldLength = getFieldLength(oModifier, aContent, iSourceFieldIndex);

					// Compute the fields target index
					// !important: groupId was used in 1.40, do not remove for compatibility!
					oTargetGroup = oModifier.bySelector(mMovedElement.target.groupSelector || mMovedElement.target.groupId, oAppComponent, oView);
					var iTargetGroupIndex = aContent.indexOf(oTargetGroup);
					// !important: groupId was used in 1.40, do not remove for compatibility!
					var oSourceGroup = oModifier.bySelector(mMovedElement.source.groupSelector || mMovedElement.source.groupId, oAppComponent, oView);
					var iSourceGroupIndex = aContent.indexOf(oSourceGroup);

					var iTargetFieldIndex = mapFieldIndexToContentAggregationIndex(oModifier, aContent, iTargetGroupIndex,
							mMovedElement.target.fieldIndex, (iSourceGroupIndex === iTargetGroupIndex)
									&& (mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex));
					var iTargetFieldLength = getFieldLength(oModifier, aContent, iTargetFieldIndex);

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
						return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView);
					}

				} else if (oChange.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_GROUP) {

					var aStopGroupToken = [MoveSimpleForm.sTypeTitle,
											MoveSimpleForm.sTypeToolBar,
											MoveSimpleForm.sTypeMTitle,
											MoveSimpleForm.sTypeOverflowToolBar];
					// !important: element was used in 1.40, do not remove for compatibility!
					var oMovedGroup = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);

					return Promise.resolve()
						.then(function(){
							// If needed, insert a Title for the first group.
							if (mMovedElement.target.groupIndex === 0 || !oMovedGroup) {
								return addTitleToFirstGroupIfNeeded(oChange, oModifier, aContent, oSimpleForm, mPropertyBag, aStopGroupToken, oContent.newControlId)
									.then(function(aContentReturn) {
										aContent = aContentReturn;
									});
							}
							return undefined;
						})
						.then(function(){
							iMovedGroupIndex = oMovedGroup ? aContent.indexOf(oMovedGroup) : 0;
							return mapGroupIndexToContentAggregationIndex(oModifier, aStopGroupToken, aContent, mMovedElement.target.groupIndex);
						})
						.then(function(iTargetIndex){
							oTargetGroup = aContent[iTargetIndex];
							var iTargetLength = measureLengthOfSequenceUntilStopToken(oModifier, iTargetIndex, aContent, aStopGroupToken);

							var iMovedLength = measureLengthOfSequenceUntilStopToken(oModifier, iMovedGroupIndex, aContent,
									aStopGroupToken);
							aContentClone = aContent.slice();
							// Cut the moved group from the result array...
							aContentClone.splice(iMovedGroupIndex, iMovedLength);

							iTargetIndex = aContentClone.indexOf(oTargetGroup);

							var iOffset = mMovedElement.source.groupIndex < mMovedElement.target.groupIndex ? iTargetLength : 0;
							// and insert it at the target index
							aContentClone = arrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex + iOffset, iMovedLength);

							return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, oView);
						});
				} else {
					Log.warning("Unknown change type detected. Cannot apply to SimpleForm");
				}
			});
	};

	/**
	 * Completes the change by adding change handler specific content
	 *
	 * @param {sap.ui.fl.Change}
	 *          oChange change object to be completed
	 * @param {object}
	 *          mSpecificChangeInfo as an empty object since no additional attributes are required for this operation
	 * @param {object}
	 *          mPropertyBag map containing the application component
	 * @public
	 */
	MoveSimpleForm.completeChangeContent = function(oChange, mSpecificChangeInfo, mPropertyBag) {
		var mStableChangeInfo;

		var oModifier = mPropertyBag.modifier;
		var oView = mPropertyBag.view;
		var oAppComponent = mPropertyBag.appComponent;

		var oSimpleForm = oModifier.bySelector(mSpecificChangeInfo.selector, oAppComponent, oView);
		var aMovedElements = mSpecificChangeInfo.movedElements;
		if (aMovedElements.length > 1) {
			Log.warning("Moving more than 1 Formelement is not yet supported.");
		}
		var mMovedElement = aMovedElements[0];
		mMovedElement.element = sap.ui.getCore().byId(mMovedElement.id);
		var oSource = Object.assign({}, mSpecificChangeInfo.source);
		var oTarget = Object.assign({}, mSpecificChangeInfo.target);
		if (!oTarget.parent) {
			oTarget.parent = sap.ui.getCore().byId(oTarget.id);
		}
		if (!oSource.parent) {
			oSource.parent = sap.ui.getCore().byId(oSource.id);
		}
		if (oSimpleForm && mMovedElement.element && oTarget.parent) {
			if (mSpecificChangeInfo.changeType === "moveSimpleFormGroup") {
				mStableChangeInfo = moveFormContainer(oSimpleForm, mMovedElement, mPropertyBag);
			} else if (mSpecificChangeInfo.changeType === "moveSimpleFormField") {
				mStableChangeInfo = moveFormElement(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag);
			}
		} else {
			Log.error("Element not found. This may be caused by an unstable id!");
		}

		var oContent = {
			targetSelector: mStableChangeInfo.targetSelector,
			movedElements: mStableChangeInfo.movedElements,
			// legacy changes had only a string with <appComponentId>---<uid>
			newControlId: oModifier.getSelector(oView.createId(uid()), oAppComponent)
		};
		oChange.setContent(oContent);

		if (mStableChangeInfo.source && mStableChangeInfo.target){
			oChange.addDependentControl(mStableChangeInfo.source, "sourceParent", mPropertyBag);
			oChange.addDependentControl(mStableChangeInfo.target, "targetParent", mPropertyBag);
		}
		oChange.addDependentControl([mStableChangeInfo.movedControl], "movedElements", mPropertyBag);
	};

	/**
		* Reverts the applied change
		*
		* @param {sap.ui.fl.Change} oChange
		*          Change object with instructions to be applied to the control map
		* @param {sap.ui.core.Control} oSimpleForm
		*          oSourceParent control that matches the change selector for applying the change, which is the source of
		*          the move
		* @param {object} mPropertyBag
		*          Map containing the control modifier object (either sap.ui.core.util.reflection.JsControlTreeModifier or
		*          sap.ui.core.util.reflection.XmlTreeModifier), the view object where the controls are embedded and the application component
		* @returns {Promise} Promise resolving when change is succesfully reverted
		* @public
		*/
	MoveSimpleForm.revertChange = function(oChange, oSimpleForm, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oAppComponent = mPropertyBag.appComponent;
		var oView = mPropertyBag.view;
		var oRevertData = oChange.getRevertData();
		var aContentSelectors = oRevertData.content;

		var aContent = aContentSelectors.map(function(oSelector) {
			return oModifier.bySelector(oSelector, oAppComponent, oView);
		});
		return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContent, oView)
			.then(function(){
				// destroy implicitly created title
				var oCreatedTitleSelector = oRevertData.createdTitleSelector;
				var oCreatedTitle = mPropertyBag.modifier.bySelector(oCreatedTitleSelector, mPropertyBag.appComponent);
				if (oCreatedTitle) {
					oCreatedTitle.destroy();
				}

				oChange.resetRevertData();

				return true;
			});
	};

	MoveSimpleForm.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		var oSourceParentContainer;
		var oTargetParentContainer;
		var oMovedElement = oChange.getContent().movedElements[0];
		var oGroupSelector = oMovedElement.source.groupSelector;
		var oAffectedControlSelector = JsControlTreeModifier.bySelector(oMovedElement.elementSelector, oAppComponent).getParent().getId();
		if (oChange.getChangeType() === MoveSimpleForm.CHANGE_TYPE_MOVE_FIELD) {
			var oSourceParentTitleElement = JsControlTreeModifier.bySelector(oMovedElement.source.groupSelector, oAppComponent);
			var oTargetParentTitleElement = JsControlTreeModifier.bySelector(oMovedElement.target.groupSelector, oAppComponent);
			oSourceParentContainer = oSourceParentTitleElement ? oSourceParentTitleElement.getParent().getId() : null;
			oTargetParentContainer = oTargetParentTitleElement ? oTargetParentTitleElement.getParent().getId() : null;
			oGroupSelector = {
				id: oSourceParentContainer
			};
		}
		return {
			affectedControls: [oAffectedControlSelector],
			dependentControls: [
				oGroupSelector && oGroupSelector.id
					? oGroupSelector
					: oChange.getContent().targetSelector
			],
			payload: {
				sourceParentContainer: oSourceParentContainer,
				targetParentContainer: oTargetParentContainer
			}
		};
	};

	return MoveSimpleForm;
},
/* bExport= */true);
