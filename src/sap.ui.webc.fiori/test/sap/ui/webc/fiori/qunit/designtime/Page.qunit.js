sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest"
], function(
	elementActionTest
) {
	"use strict";

	var fnConfirmText1IsOn3rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label1").getId(),
			oViewAfterAction.byId("myPageId").getContent()[2].getId(),
			"then the control has been moved to the right position");
	};

	var fnConfirmText1IsOn1rdPosition = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("label1").getId(),
			oViewAfterAction.byId("myPageId").getContent()[0].getId(),
			"then the control has been moved to the previous position");
	};

	elementActionTest("Checking the move action for Page content", {
		xmlView: '<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:wcm="sap.ui.webc.main" xmlns="sap.ui.webc.fiori">"' +
		'<Page id="myPageId">' +
			'<content>' +
				'<wcm:Label id="label1" text="Lorem ipsum dolor st amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat" />' +
				'<wcm:Button text="Accept" />' +
				'<wcm:Button text="Reject" />' +
				'<wcm:Button text="Edit" />' +
				'<wcm:Button text="Delete" />' +
			'</content>' +
		'</Page>' +
		'</mvc:View>'
		,
		action: {
			name: "move",
			controlId: "myPageId",
			parameter: function (oView) {
				return {
					movedElements: [{
						element: oView.byId("label1"),
						sourceIndex: 0,
						targetIndex: 2
					}],
					source: {
						aggregation: "content",
						parent: oView.byId("myPageId"),
						publicAggregation: "content",
						publicParent: oView.byId("myPageId")
					},
					target: {
						aggregation: "content",
						parent: oView.byId("myPageId"),
						publicAggregation: "content",
						publicParent: oView.byId("myPageId")
					}
				};
			}
		},
		afterAction: fnConfirmText1IsOn3rdPosition,
		afterUndo: fnConfirmText1IsOn1rdPosition,
		afterRedo: fnConfirmText1IsOn3rdPosition
	});
});