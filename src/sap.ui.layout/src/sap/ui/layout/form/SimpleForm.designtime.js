/*!
 * ${copyright}
 */

// Provides the Design Time Metadata for the sap.ui.layout.form.SimpleForm control
sap.ui.define([], function() {
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

	return {
		aggregations : {
			content : {
				ignore : true
			},
			form : {
				ignore : false,

				afterMove : function(oMovedElement, oSource, oTarget) {

					var aResult = [];
					var oSimpleForm = oMovedElement.getParent().getParent();

					if (oMovedElement instanceof sap.ui.layout.form.FormContainer) {

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
						var oAction = fnCreateReorderAction(oSimpleForm.getId(), fnExtractElementIds(aContentClone));

						aResult.push(oAction);

					} else if (oMovedElement instanceof sap.ui.layout.form.FormElement) {

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

						var oAction = fnCreateReorderAction(oSimpleForm.getId(), fnExtractElementIds(aContentClone));
						aResult.push(oAction);
					}
					return aResult;
				}

			}
		}
	};

}, /* bExport= */false);