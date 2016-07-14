/*
 * ! ${copyright}
 */
sap.ui
		.define(
				['jquery.sap.global', 'sap/ui/dt/command/BaseCommand', 'sap/ui/dt/ElementUtil'],
				function(jQuery, BaseCommand, ElementUtil) {
					"use strict";

					/**
					 * Move Element from one place to another
					 *
					 * @class
					 * @extends sap.ui.dt.command.BaseCommand
					 * @author SAP SE
					 * @version ${version}
					 * @constructor
					 * @private
					 * @since 1.40
					 * @alias sap.ui.dt.command.SimpleFormMove
					 * @experimental Since 1.40. This class is experimental and provides only limited functionality. Also the API
					 *               might be changed in future.
					 */
					var SimpleFormMove = BaseCommand.extend("sap.ui.dt.command.SimpleFormMove", {
						metadata : {
							properties : {
								movedElements : {
									type : "array"
								},
								target : {
									type : "object"
								},
								source : {
									type : "object"
								},
								changeType : {
									type : "string",
									defaultValue : "moveSimpleFormElement"
								},
								action : {
									type : "object"
								}
							}
						}
					});

					SimpleFormMove.prototype._setReverseAction = function(oAction) {
						this._reverseAction = oAction;
					};

					SimpleFormMove.prototype._getReverseAction = function() {
						return (this._reverseAction);
					};

					SimpleFormMove.prototype._executeWithElement = function(oElement) {

						oElement = fnGetSimpleFormContainer(oElement);
						var oAction = this.getAction();

						if (!oAction) {
							var oSimpleForm = oElement;
							var aMovedElements = this.getMovedElements();
							if (aMovedElements.length > 1) {
								jQuery.sap.log.warning("Moving more than 1 Formelement is not yet supported.");
							}
							var oTarget = this.getTarget();

							if (aMovedElements[0].element instanceof sap.ui.layout.form.FormContainer) {
								oAction = fnMoveFormContainer(oSimpleForm, aMovedElements[0], oTarget);
							} else if (aMovedElements[0].element instanceof sap.ui.layout.form.FormElement) {
								oAction = fnMoveFormElement(oSimpleForm, aMovedElements[0], oTarget);
							}
							this.setAction(oAction);
							var oReverseAction = jQuery.extend(true, {}, oAction);
							oReverseAction.source.elements = fnGetAll(sap.ui.getCore().byId(oAction.target.parent), oAction);
							this._setReverseAction(oReverseAction);
						}

						if (oAction) {
							fnExChangeContent(oAction);
						}
					};

					SimpleFormMove.prototype._undoWithElement = function(oElement) {
						fnSwapAction(this);
						this._executeWithElement(oElement);
					};

					var fnGetSimpleFormContainer = function(oElement) {
						if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.SimpleForm")) {
							return oElement;
						} else if (ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.Form")
								|| ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormContainer")
								|| ElementUtil.isInstanceOf(oElement, "sap.ui.layout.form.FormElement")) {
							return fnGetSimpleFormContainer(oElement.getParent());
						}
					};

					var fnMapFormIndexToContentAggregationIndex = function(oType, aContent, inThInstance) {
						var oResult;
						var iCurrentGroupIndex = -1;
						for (var i = 0; i < aContent.length; i++) {
							if (aContent[i] instanceof oType) {
								iCurrentGroupIndex++;
								if (iCurrentGroupIndex === inThInstance) {
									oResult = aContent[i];
									break;
								}
							}
						}
						return aContent.indexOf(oResult);
					};

					var fnMeasureLengthOfFormContainer = function(oFormContainer) {
						var aFormElements = oFormContainer.getFormElements();
						var iMovedLength = aFormElements.reduce(function(previousValue, currentValue, currentIndex, array) {
							previousValue += currentValue.getFields().length + 1;
							return previousValue;
						}, 1);
						return iMovedLength;
					};

					var fnExtractElementIds = function(aComponents) {
						var aResult = [];
						for (var i = 0; i < aComponents.length; i++) {
							aResult.push(aComponents[i].getId());
						}
						return aResult;
					};

					var fnArrayRangeCopy = function(aSource, iSourceIndex, aTarget, iTargetIndex, iMovedLength) {
						var aResult = aTarget;
						for (var i = 0; i < iMovedLength; i++) {
							aResult.splice(iTargetIndex + i, 0, aSource[iSourceIndex + i]);
						}
						return aResult;
					};

					var fnCreateReorderAction = function(oParent, aElements) {
						return {
							changeType : 'reorder_aggregation',
							source : {
								elements : aElements
							},
							target : {
								parent : oParent,
								aggregation : 'content'
							}
						};
					};

					var fnMoveFormContainer = function(oSimpleForm, mMovedElement, oTarget) {
						var aContent = oSimpleForm.getContent();
						var oMovedGroupTitle = mMovedElement.element.getTitle();
						var iMovedGroupIndex = aContent.indexOf(oMovedGroupTitle);

						var iTargetIndex = fnMapFormIndexToContentAggregationIndex(sap.ui.core.Title, aContent, mMovedElement.targetIndex);
						var iMovedLength = fnMeasureLengthOfFormContainer(mMovedElement.element);

						var aContentClone = aContent.slice();
						// Cut the moved group from the result array...
						aContentClone.splice(iMovedGroupIndex, iMovedLength);
						// and insert it at the target index
						aContentClone = fnArrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex, iMovedLength);
						return fnCreateReorderAction(oSimpleForm.getId(), fnExtractElementIds(aContentClone));
					};

					var fnMoveFormElement = function(oSimpleForm, mMovedElement, oTarget) {

						var aContent = oSimpleForm.getContent();
						var aFormElementsWithinTargetContainer = oTarget.parent.getFormElements();

						var iSourceIndex = aContent.indexOf(mMovedElement.element.getLabel());
						//use target index as the internal controls have already been modified
						var iSourceLength = aFormElementsWithinTargetContainer[mMovedElement.targetIndex].getFields().length + 1;

						var iTargetIndex = aContent.indexOf(oTarget.parent.getTitle());
						if (iTargetIndex > iSourceIndex) {
							iTargetIndex = iTargetIndex - iSourceLength;
						}
						// measure length of all elements before insert point
						var iOffset = 0;
						for (var k = 0; k < mMovedElement.targetIndex; k++) {
							iOffset = iOffset + aFormElementsWithinTargetContainer[k].getFields().length + 1;
						}
						iTargetIndex = iTargetIndex + iOffset + 1;

						// Copy the content
						var aContentClone = aContent.slice();
						// Cut the moved group from the result array...
						aContentClone.splice(iSourceIndex, iSourceLength);
						// and insert it at the target index
						aContentClone = fnArrayRangeCopy(aContent, iSourceIndex, aContentClone, iTargetIndex, iSourceLength);
						return fnCreateReorderAction(oSimpleForm.getId(), fnExtractElementIds(aContentClone));
					};

					var fnGetAll = function(oTargetParent, oAction) {
						var sAggregationGetAllMutator = ElementUtil.getAggregationAccessors(oTargetParent,
								oAction.target.aggregation).get;
						return fnExtractElementIds(oTargetParent[sAggregationGetAllMutator]());
					};

					var fnRemoveAll = function(oTargetParent, oAction) {
						var sAggregationRemoveAllMutator = ElementUtil.getAggregationAccessors(oTargetParent,
								oAction.target.aggregation).removeAll;
						oTargetParent[sAggregationRemoveAllMutator]();
					};

					var fnAddAll = function(oTargetParent, oAction) {
						var sAggregationAddMutator = ElementUtil.getAggregationAccessors(oTargetParent, oAction.target.aggregation).add;
						var oActElement;
						for (var j = 0; j < oAction.source.elements.length; j++) {
							oActElement = sap.ui.getCore().byId(oAction.source.elements[j]);
							oTargetParent[sAggregationAddMutator](oActElement);
						}
					};

					var fnExChangeContent = function(oAction) {
						var oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
						fnRemoveAll(oTargetParent, oAction);
						fnAddAll(oTargetParent, oAction);
					};

					// swap action with its reverse action, so a client can always get the actual action by calling 'getAction'
					var fnSwapAction = function(oContext) {
						var oTmp = oContext._getReverseAction();
						oContext._setReverseAction(oContext.getAction());
						oContext.setAction(oTmp);
					};

					return SimpleFormMove;

				}, /* bExport= */true);
