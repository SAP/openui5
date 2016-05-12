/*
 * ! ${copyright}
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/dt/command/BaseCommand'],
		function(jQuery, BaseCommand) {
			"use strict";

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

				var fnMoveFormContainer = function(oSimpleForm, oMovedElement, oTarget){
					var aContent = oSimpleForm.getContent();
					var oMovedGroupTitle = oMovedElement.getTitle();
					var iMovedGroupIndex = aContent.indexOf(oMovedGroupTitle);

					var iTargetIndex = fnMapFormIndexToContentAggregationIndex(sap.ui.core.Title, aContent, oTarget.index);
					var iMovedLength = fnMeasureLengthOfFormContainer(oMovedElement);

					var aContentClone = aContent.slice();
					// Cut the moved group from the result array...
					aContentClone.splice(iMovedGroupIndex, iMovedLength);
					// and insert it at the target index
					aContentClone = fnArrayRangeCopy(aContent, iMovedGroupIndex, aContentClone, iTargetIndex, iMovedLength);
					return fnCreateReorderAction(oSimpleForm.getId(), fnExtractElementIds(aContentClone));
				};

				var fnMoveFormElement = function(oSimpleForm, oMovedElement, oTarget) {

					oSimpleForm = oSimpleForm.getParent();
					var aContent = oSimpleForm.getContent();
					var aFormElementsWithinTargetContainer = oTarget.parent.getFormElements();

					var iSourceIndex = aContent.indexOf(oMovedElement.getLabel());
					var iSourceLength = aFormElementsWithinTargetContainer[oTarget.index].getFields().length + 1;

					var iTargetIndex = aContent.indexOf(oTarget.parent.getTitle());
					if (iTargetIndex > iSourceIndex) {
						iTargetIndex = iTargetIndex - iSourceLength;
					}
					// measure length of all elements before insert point
					var iOffset = 0;
					for (var k = 0; k < oTarget.index; k++) {
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

			/**
			 * Move Element from one place to another
			 *
			 * @class
			 * @extends sap.ui.rta.command.FlexCommand
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
						movedElement : {
							type : "string"
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
						}
					}
				}
		  });

			BaseCommand.prototype._executeWithElement = function(oElement) {
//sap.ui.dt.OverlayRegistry.getOverlay(oSource.parent).getPublicParentElementOverlay().getElement()
					//var oSimpleForm = oElement.getParent().getParent();
					var oAction = {};
					var oSimpleForm = oElement;
					var oMovedElement = this.getMovedElement();
					var oTarget = this.getTarget();

					if (oMovedElement instanceof sap.ui.layout.form.FormContainer) {

						oAction = fnMoveFormContainer(oSimpleForm, oMovedElement, oTarget);

					} else if (oMovedElement instanceof sap.ui.layout.form.FormElement) {

						oAction = fnMoveFormElement(oSimpleForm, oMovedElement, oTarget);

					}

					var oTargetParent = sap.ui.getCore().byId(oAction.target.parent);
					var sAggregationRemoveAllMutator = this
								.getAggregationAccessors(oTargetParent, oAction.target.aggregation).removeAll;
						oTargetParent[sAggregationRemoveAllMutator]();
					var sAggregationAddMutator = this.getAggregationAccessors(oTargetParent, oAction.target.aggregation).add;
					var oActElement;
					for (var j = 0; j < oAction.source.elements.length; j++) {
						oActElement = sap.ui.getCore().byId(oAction.source.elements[j]);
						oTargetParent[sAggregationAddMutator](oActElement);
					}

			};

			return SimpleFormMove;

		}, /* bExport= */true);
