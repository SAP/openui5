/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/base/util/uid",
	"sap/base/Log"
], function(
	Element,
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
	const MoveSimpleForm = {};

	const CHANGE_TYPE_MOVE_FIELD = "moveSimpleFormField";
	const CHANGE_TYPE_MOVE_GROUP = "moveSimpleFormGroup";
	const TITLE_TYPE = "sap.ui.core.Title";
	const MTITLE_TYPE = "sap.m.Title";
	const TOOLBAR_TYPE = "sap.m.Toolbar";
	const OVERFLOW_TOOLBAR_TYPE = "sap.m.OverflowToolbar";
	const LABEL_TYPE = "sap.m.Label";
	const SMARTLABEL_TYPE = "sap.ui.comp.smartfield.SmartLabel";
	const CONTENT_AGGREGATION = "content";
	const FORM_CONTAINER = "sap.ui.layout.form.FormContainer";

	function firstGroupWithoutTitle(oModifier, aStopToken, aContent) {
		return aContent.reduce(function(oPreviousPromise, oContent){
			return oPreviousPromise
				.then(function(bReturnValue){
					if (bReturnValue !== undefined) {
						return bReturnValue;
					}
					const sType = oModifier.getControlType(oContent);
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
					const oView = mPropertyBag.view;
					const oAppComponent = mPropertyBag.appComponent;
					let oTitle;
					return Promise.resolve()
						.then(oModifier.createControl.bind(oModifier, TITLE_TYPE, oAppComponent, oView, oGroupSelector))
						.then(function(oCreatedTitle){
							oTitle = oCreatedTitle;
							oModifier.setProperty(oTitle, "text", "");
							return oModifier.insertAggregation(oSimpleForm, CONTENT_AGGREGATION, oTitle, 0, oView);
						})
						.then(function() {
							const oNewRevertData = oChange.getRevertData();
							oNewRevertData.createdTitleSelector = mPropertyBag.modifier.getSelector(oTitle, mPropertyBag.appComponent);
							oChange.setRevertData(oNewRevertData);
						});
				}
				return Promise.resolve();
			})
			.then(function(){
				return oModifier.getAggregation(oSimpleForm, CONTENT_AGGREGATION);
			});
	}

	function mapGroupIndexToContentAggregationIndex(oModifier, aStopToken, aContent, iGroupIndex) {
		let oResult;
		let iCurrentGroupIndex = -1;

		return firstGroupWithoutTitle(oModifier, aStopToken, aContent)
			.then(function(bFirstGroupWithoutName){
				if (bFirstGroupWithoutName) {
					iCurrentGroupIndex++;
				}
				for (let i = 0; i < aContent.length; i++) {
					const sType = oModifier.getControlType(aContent[i]);
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
		const sType = oModifier.getControlType(aElements[iIndex]);
		return (
			TITLE_TYPE === sType
				|| TOOLBAR_TYPE === sType
				|| MTITLE_TYPE === sType
				|| OVERFLOW_TOOLBAR_TYPE === sType
		);
	}

	function measureLengthOfSequenceUntilStopToken(oModifier, iMovedElementIndex, aContent, aStopToken) {
		let i = 0;
		for (i = iMovedElementIndex + 1; i < aContent.length; ++i) {
			const sType = oModifier.getControlType(aContent[i]);
			if (aStopToken.indexOf(sType) > -1) {
				break;
			}
		}
		return i - iMovedElementIndex;
	}

	function getFieldLength(oModifier, aElements, iIndex) {
		return measureLengthOfSequenceUntilStopToken(oModifier, iIndex, aElements,
			[
				TITLE_TYPE,
				MTITLE_TYPE,
				TOOLBAR_TYPE,
				OVERFLOW_TOOLBAR_TYPE,
				LABEL_TYPE,
				SMARTLABEL_TYPE
			]
		);
	}

	function mapFieldIndexToContentAggregationIndex(oModifier, aContent, iGroupStart, iFieldIndex, bUp) {
		if (!isTitleOrToolbar(aContent, iGroupStart, oModifier)) {
			Log.error("Illegal argument. iIndex has to point to a Label.");
			return -1;
		} else {
			iFieldIndex = bUp ? iFieldIndex + 1 : iFieldIndex;
			let iCurrentRelativeFieldIndex = 0;
			let iAbsolutIndex = iGroupStart;
			let iActLength;
			while (iAbsolutIndex < aContent.length && iCurrentRelativeFieldIndex < iFieldIndex) {
				++iCurrentRelativeFieldIndex;
				iActLength = getFieldLength(oModifier, aContent, iAbsolutIndex);
				iAbsolutIndex += iActLength;
			}
			return iAbsolutIndex;
		}
	}

	function arrayRangeCopy(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
		const aResult = aTarget;
		for (let i = 0; i < iMovedLength; i++) {
			aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
		}
		return aResult;
	}

	function getGroupHeader(oElement) {
		return oElement.getTitle() || oElement.getToolbar();
	}

	function moveFormContainer(oSimpleForm, mMovedElement, mPropertyBag) {
		const oMovedGroupTitle = getGroupHeader(mMovedElement.element);
		const oSimpleFormSelector = mPropertyBag.modifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
		const mMovedSimpleFormElement = {
			elementSelector: mPropertyBag.modifier.getSelector(oMovedGroupTitle, mPropertyBag.appComponent),
			source: {
				groupIndex: mMovedElement.sourceIndex
			},
			target: {
				groupIndex: mMovedElement.targetIndex
			}
		};

		return {
			changeType: CHANGE_TYPE_MOVE_GROUP,
			targetSelector: oSimpleFormSelector,
			movedControl: oMovedGroupTitle,
			movedElements: [mMovedSimpleFormElement]
		};
	}

	function moveFormElement(oSimpleForm, mMovedElement, oSource, oTarget, mPropertyBag) {
		const oSimpleFormSelector = mPropertyBag.modifier.getSelector(oSimpleForm, mPropertyBag.appComponent);
		const oLabel = mMovedElement.element.getLabel();
		const oLabelSelector = mPropertyBag.modifier.getSelector(oLabel, mPropertyBag.appComponent);
		const oTargetGroupHeader = getGroupHeader(oTarget.parent);
		const oSourceGroupHeader = getGroupHeader(oSource.parent);
		const oTargetSelector = mPropertyBag.modifier.getSelector(oTargetGroupHeader, mPropertyBag.appComponent);
		const oSourceSelector = mPropertyBag.modifier.getSelector(oSourceGroupHeader, mPropertyBag.appComponent);

		// When moving a field from/to a headerless group, save the parent id instead of the header id
		if (!oSourceSelector.id) {
			oSourceSelector.id = oSource.parent.getId();
		}
		if (!oTargetSelector.id) {
			oTargetSelector.id = oTarget.parent.getId();
		}

		const oMovedElement = {
			elementSelector: oLabelSelector,
			source: {
				groupSelector: oSourceSelector,
				fieldIndex: mMovedElement.sourceIndex
			},
			target: {
				groupSelector: oTargetSelector,
				fieldIndex: mMovedElement.targetIndex
			}
		};

		return {
			changeType: CHANGE_TYPE_MOVE_FIELD,
			targetSelector: oSimpleFormSelector,
			target: oTargetGroupHeader,
			source: oSourceGroupHeader,
			movedControl: oLabel,
			movedElements: [oMovedElement]
		};
	}

	function removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, aContent, oView) {
		return Promise.resolve()
			.then(function() {
				// Remove each control from the "content" aggregation without leaving them orphan (would reset bindings)
				return aContent.reduce(function(oPreviousPromise, oContent) {
					return oPreviousPromise
					.then(oModifier.insertAggregation.bind(oModifier, oSimpleForm, "dependents", oContent, 0, oView));
				}, Promise.resolve());
			})
			.then(function(){
				// Add the removed controls one by one in the new order
				return aContentClone.reduce(function(oPreviousPromise, oContentClone, iIndex) {
					return oPreviousPromise
						.then(oModifier.insertAggregation.bind(oModifier,
							oSimpleForm,
							CONTENT_AGGREGATION,
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
		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;
		let oTargetGroup;
		let aContentClone;
		let iMovedGroupIndex;

		const oContent = oChange.getContent();
		const mMovedElement = oContent.movedElements[0];
		return Promise.resolve()
			.then(function(){
				return oModifier.getAggregation(oSimpleForm, CONTENT_AGGREGATION);
			})
			.then(function(aContent){
				const aContentSelectors = aContent.map(function(oContentControl) {
					return oModifier.getSelector(oContentControl, oAppComponent);
				});
				const mState = {content: aContentSelectors};
				oChange.setRevertData(mState);

				if (oChange.getChangeType() === CHANGE_TYPE_MOVE_FIELD) {
					// !important: element was used in 1.40, do not remove for compatibility!
					const oSourceField = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
					const iSourceFieldIndex = aContent.indexOf(oSourceField);
					const iSourceFieldLength = getFieldLength(oModifier, aContent, iSourceFieldIndex);

					// Compute the fields target index
					// !important: groupId was used in 1.40, do not remove for compatibility!
					const oSourceGroup = oModifier.bySelector(mMovedElement.source.groupSelector || mMovedElement.source.groupId, oAppComponent, oView);
					oTargetGroup = oModifier.bySelector(mMovedElement.target.groupSelector || mMovedElement.target.groupId, oAppComponent, oView);

					// If the source/target groups are FormContainers, they are not part of aContent and get ignored in the following logic
					const iSourceGroupIndex = aContent.indexOf(oSourceGroup);
					const iTargetGroupIndex = aContent.indexOf(oTargetGroup);
					const iTargetFieldIndex = mapFieldIndexToContentAggregationIndex(oModifier, aContent, iTargetGroupIndex,
							mMovedElement.target.fieldIndex, (iSourceGroupIndex === iTargetGroupIndex)
									&& (mMovedElement.source.fieldIndex < mMovedElement.target.fieldIndex));
					const iTargetFieldLength = getFieldLength(oModifier, aContent, iTargetFieldIndex);

					aContentClone = aContent.slice();
					const aFieldElements = aContentClone.slice(iSourceFieldIndex, iSourceFieldIndex + iSourceFieldLength);

					let aSegmentBeforeSource, aSegmentBeforeTarget, aSegmentBetweenSourceAndTarget, aSegmentTillEnd;
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
						return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, aContent, oView);
					}

				} else if (oChange.getChangeType() === CHANGE_TYPE_MOVE_GROUP) {
					const aStopGroupToken = [TITLE_TYPE,
											TOOLBAR_TYPE,
											MTITLE_TYPE,
											OVERFLOW_TOOLBAR_TYPE];
					// !important: element was used in 1.40, do not remove for compatibility!
					const oMovedGroup = oModifier.bySelector(mMovedElement.elementSelector || mMovedElement.element, oAppComponent, oView);
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
							const iTargetLength = measureLengthOfSequenceUntilStopToken(oModifier, iTargetIndex, aContent, aStopGroupToken);

							const iMovedLength = measureLengthOfSequenceUntilStopToken(oModifier, iMovedGroupIndex, aContent,
									aStopGroupToken);
							aContentClone = aContent.slice();
							// Cut the moved group from the result array...
							aContentClone.splice(iMovedGroupIndex, iMovedLength);

							iTargetIndex = aContentClone.indexOf(oTargetGroup);

							const iOffset = mMovedElement.source.groupIndex < mMovedElement.target.groupIndex ? iTargetLength : 0;
							// and insert it at the target index
							aContentClone = arrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex + iOffset, iMovedLength);

							return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContentClone, aContent, oView);
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
		let mStableChangeInfo;

		const oModifier = mPropertyBag.modifier;
		const oView = mPropertyBag.view;
		const oAppComponent = mPropertyBag.appComponent;

		const oSimpleForm = oModifier.bySelector(mSpecificChangeInfo.selector, oAppComponent, oView);
		const aMovedElements = mSpecificChangeInfo.movedElements;
		if (aMovedElements.length > 1) {
			Log.warning("Moving more than 1 Formelement is not yet supported.");
		}
		const mMovedElement = aMovedElements[0];
		mMovedElement.element = Element.getElementById(mMovedElement.id);
		const oSource = Object.assign({}, mSpecificChangeInfo.source);
		const oTarget = Object.assign({}, mSpecificChangeInfo.target);
		if (!oTarget.parent) {
			oTarget.parent = Element.getElementById(oTarget.id);
		}
		if (!oSource.parent) {
			oSource.parent = Element.getElementById(oSource.id);
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

		const oContent = {
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

		// Headerless groups will get a Title during apply
		if (mStableChangeInfo.movedControl) {
			oChange.addDependentControl([mStableChangeInfo.movedControl], "movedElements", mPropertyBag);
		}
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
		const oModifier = mPropertyBag.modifier;
		const oAppComponent = mPropertyBag.appComponent;
		const oView = mPropertyBag.view;
		const oRevertData = oChange.getRevertData();
		const aContentSelectors = oRevertData.content;
		return oModifier.getAggregation(oSimpleForm, CONTENT_AGGREGATION)
		.then(function(aCurrentContent) {
			const aContent = aContentSelectors.map(function(oSelector) {
				return oModifier.bySelector(oSelector, oAppComponent, oView);
			});
			return removeAndInsertAggregation(oModifier, oSimpleForm, MoveSimpleForm, aContent, aCurrentContent, oView)
			.then(function(){
				// destroy implicitly created title
				const oCreatedTitleSelector = oRevertData.createdTitleSelector;
				const oCreatedTitle = mPropertyBag.modifier.bySelector(oCreatedTitleSelector, mPropertyBag.appComponent);
				if (oCreatedTitle) {
					oCreatedTitle.destroy();
				}

				oChange.resetRevertData();

				return true;
			});
		});
	};

	MoveSimpleForm.getChangeVisualizationInfo = function(oChange, oAppComponent) {
		let oMovedElementInstance;
		const oMovedElement = oChange.getContent().movedElements[0];
		if (oMovedElement.elementSelector.id) {
			oMovedElementInstance = JsControlTreeModifier.bySelector(oMovedElement.elementSelector, oAppComponent);
		} else if (oChange.getContent().newControlId) {
			// New group header is created (e.g. move headerless group)
			oMovedElementInstance = JsControlTreeModifier.bySelector(oChange.getContent().newControlId, oAppComponent);
		}
		let oSourceSelector = oMovedElement.source.groupSelector ? {...oMovedElement.source.groupSelector} : {};
		const oTargetSelector = oMovedElement.target.groupSelector ? {...oMovedElement.target.groupSelector} : {};
		if (oChange.getChangeType() === CHANGE_TYPE_MOVE_FIELD) {
			const oSourceGroupOrTitleElement = JsControlTreeModifier.bySelector(oSourceSelector, oAppComponent);
			const oTargetGroupOrTitleElement = JsControlTreeModifier.bySelector(oMovedElement.target.groupSelector, oAppComponent);

			if (oSourceGroupOrTitleElement && oSourceGroupOrTitleElement.isA(FORM_CONTAINER)) {
				oSourceSelector.id = oSourceGroupOrTitleElement.getId();
			} else {
				oSourceSelector.id = oSourceGroupOrTitleElement ? oSourceGroupOrTitleElement.getParent().getId() : null;
			}

			if (oTargetGroupOrTitleElement && oTargetGroupOrTitleElement.isA(FORM_CONTAINER)) {
				oTargetSelector.id = oTargetGroupOrTitleElement.getId();
			} else {
				oTargetSelector.id = oTargetGroupOrTitleElement ? oTargetGroupOrTitleElement.getParent().getId() : null;
			}
		} else if (!oSourceSelector && isTitleOrToolbar([oMovedElementInstance], 0, JsControlTreeModifier)) {
			// Move headerless group
			const oGroup = oMovedElementInstance.getParent();
			oSourceSelector = {
				id: oGroup.getId()
			};
		}

		const oAffectedControlId = oMovedElementInstance.getParent().getId();
		return {
			affectedControls: [oAffectedControlId],
			dependentControls: [
				oSourceSelector && oSourceSelector.id
					? oSourceSelector
					: oChange.getContent().targetSelector
			],
			updateRequired: true,
			descriptionPayload: {
				sourceContainer: oSourceSelector.id,
				targetContainer: oTargetSelector.id
			}
		};
	};

	return MoveSimpleForm;
});