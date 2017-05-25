(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/rta/test/controlEnablingCheck"
	], function (rtaControlEnablingCheck) {

		var fnConfirmGroupelement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("actionButton1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("subSection").getActions() [1].getId(),   // Id of third element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmGroupelement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("actionButton1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("subSection").getActions() [0].getId(),   // Id of third element in group after change has been applied
				"then the control has been moved to the previous position");
		};
		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a sap.uxap.ObjectPageSubSection control", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			' xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection>' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection" title="Subsection with action buttons">' +
									'<uxap:actions>' +
										'<m:Button id="actionButton1" text="Action1" icon="sap-icon://synchronize" />' +
										'<m:Button id="actionButton2" text="Action2" icon="sap-icon://expand" />' +
									'</uxap:actions>' +
									'<m:Button text="Subsection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>',
			action : {
				name : "move",
				controlId : "subSection",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("actionButton1"),
							sourceIndex : 0,
							targetIndex : 1
						}],
						source : {
							aggregation: "actions",
							parent: oView.byId("subSection")
						},
						target : {
							aggregation: "actions",
							parent: oView.byId("subSection")
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