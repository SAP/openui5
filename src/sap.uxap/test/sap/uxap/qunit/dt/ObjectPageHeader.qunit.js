(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/rta/test/controlEnablingCheck"
	], function (rtaControlEnablingCheck) {

		var fnConfirmGroupelement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("actionButton1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("header").getActions() [1].getId(),   // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmGroupelement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("actionButton1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("header").getActions() [0].getId(),   // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};
		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a sap.uxap.ObjectPageHeader control", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			' xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
					'<uxap:headerTitle>' +
						'<uxap:ObjectPageHeader id="header">' +
							'<uxap:actions>' +
								'<uxap:ObjectPageHeaderActionButton id="actionButton1" text="Action1" />' +
								'<uxap:ObjectPageHeaderActionButton id="actionButton2" text="Action2" />' +
							'</uxap:actions>' +
						'</uxap:ObjectPageHeader>' +
					'</uxap:headerTitle>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>',
			action : {
				name : "move",
				controlId : "header",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("actionButton1"),
							sourceIndex : 0,
							targetIndex : 1
						}],
						source : {
							aggregation: "actions",
							parent: oView.byId("header")
						},
						target : {
							aggregation: "actions",
							parent: oView.byId("header")
						}
					};
				}
			},
			layer : "VENDOR",
			afterAction : fnConfirmGroupelement1IsOn2ndPosition,
			afterUndo : fnConfirmGroupelement1IsOn1stPosition,
			afterRedo : fnConfirmGroupelement1IsOn2ndPosition
		});
	});
})();