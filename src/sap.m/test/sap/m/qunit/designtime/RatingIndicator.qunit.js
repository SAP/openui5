sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/rta/enablement/elementActionTest"
], function(QUnitUtils, createAndAppendDiv, elementActionTest) {
	'use strict';
	createAndAppendDiv("content");


	// Remove and reveal actions
	var fnConfirmRatingIndicatorIsInvisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("ratingIndicator").getVisible(), false, "then the ratingIndicator element is invisible");
	};

	var fnConfirmRatingIndicatorIsVisible = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("ratingIndicator").getVisible(), true, "then the ratingIndicator element is visible");
	};

	elementActionTest("Checking the remove action for RatingIndicator", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:RatingIndicator maxValue="5" value="4" id="ratingIndicator" />' +
		'</mvc:View>'
		,
		action: {
			name: "remove",
			controlId: "ratingIndicator",
			parameter: function (oView) {
				return {
					removedElement: oView.byId("ratingIndicator")
				};
			}
		},
		afterAction: fnConfirmRatingIndicatorIsInvisible,
		afterUndo: fnConfirmRatingIndicatorIsVisible,
		afterRedo: fnConfirmRatingIndicatorIsInvisible
	});

	elementActionTest("Checking the reveal action for a RatingIndicator", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:m="sap.m">"' +
			'<m:RatingIndicator maxValue="5" value="4" id="ratingIndicator" visible="false"/>' +
		'</mvc:View>'
		,
		action: {
			name: "reveal",
			controlId: "ratingIndicator",
			parameter: function(oView){
				return {};
			}
		},
		afterAction: fnConfirmRatingIndicatorIsVisible,
		afterUndo: fnConfirmRatingIndicatorIsInvisible,
		afterRedo: fnConfirmRatingIndicatorIsVisible
	});

});