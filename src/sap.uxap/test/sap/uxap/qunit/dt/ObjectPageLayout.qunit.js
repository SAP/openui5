(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/rta/test/controlEnablingCheck"
	], function (rtaControlEnablingCheck) {

		var fnConfirmGroupelement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("btn1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("objectPage").getHeaderContent() [1].getId(),   // Id of second element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmGroupelement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("btn1").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("objectPage").getHeaderContent() [0].getId(),   // Id of second element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a sap.uxap.ObjectPage control in headerContent", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="objectPage">' +
				'<uxap:headerContent>' +
					'<m:Button text="Button1" id="btn1"/>' +
					'<m:Button text="Button1" id="btn2"/>' +
					'<m:Button text="Button1" id="btn3"/>' +
				'</uxap:headerContent>' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection" title="Subsection with action buttons">' +
								'<uxap:actions>' +
									'<m:Button icon="sap-icon://synchronize" />' +
									'<m:Button icon="sap-icon://expand" />' +
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
				controlId : "btn1",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("btn1"),
							sourceIndex : 0,
							targetIndex : 1
						}],
						source : {
							aggregation: "headerContent",
							parent: oView.byId("objectPage")
						},
						target : {
							aggregation: "headerContent",
							parent: oView.byId("objectPage")
						}
					};
				}
			},
			afterAction : fnConfirmGroupelement1IsOn2ndPosition,
			afterUndo : fnConfirmGroupelement1IsOn1stPosition,
			afterRedo : fnConfirmGroupelement1IsOn2ndPosition
		});
	});
})();