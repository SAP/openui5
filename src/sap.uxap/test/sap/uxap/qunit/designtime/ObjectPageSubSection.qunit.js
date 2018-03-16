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

		// Rename action
		var fnConfirmSubSectionRenamedWithNewValue = function (oSubSection, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
				"Title 2",
				"then the control has been renamed to the new value (Title 2)");
		};

		var fnConfirmSubSectionIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
				"Title 1",
				"then the control has been renamed to the old value (Title 1)");
		};

		var XML_VIEW = '<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			' xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection>' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection" title="Title 1" >' +
									'<m:Button text="Subsection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
								'<uxap:ObjectPageSubSection id="invisibleSubSection" title="Title invisibleSubSection" visible="false" >' +
									'<m:Button text="invisibleSubSection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>';

		rtaControlEnablingCheck("Checking the rename action for a SubSection", {
			xmlView: XML_VIEW,
			action: {
				name: "rename",
				controlId: "subSection",
				parameter: function (oView) {
					return {
						newValue: 'Title 2',
						renamedElement: oView.byId("subSection")
					};
				}
			},
			afterAction: fnConfirmSubSectionRenamedWithNewValue,
			afterUndo: fnConfirmSubSectionIsRenamedWithOldValue,
			afterRedo: fnConfirmSubSectionRenamedWithNewValue
		});

		// Remove and reveal actions
		var fnConfirmSubSectionIsInvisible = function (sSubSectionId, oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId(sSubSectionId).getVisible(), false, "then the SubSection element is invisible");
		};

		var fnConfirmSubSectionIsVisible = function (sSubSectionId, oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId(sSubSectionId).getVisible(), true, "then the SubSection element is visible");
		};

		rtaControlEnablingCheck("Checking the remove action for SubSection", {
			xmlView: XML_VIEW,
			action: {
				name: "remove",
				controlId: "subSection",
				parameter: function (oView) {
					return {
						removedElement: oView.byId("subSection")
					};
				}
			},
			afterAction: fnConfirmSubSectionIsInvisible.bind(null, "subSection"),
			afterUndo: fnConfirmSubSectionIsVisible.bind(null, "subSection"),
			afterRedo: fnConfirmSubSectionIsInvisible.bind(null, "subSection")
		});

		rtaControlEnablingCheck("Checking the reveal action for a SubSection", {
			xmlView: XML_VIEW,
			action: {
				name: "reveal",
				controlId: "invisibleSubSection",
				parameter: function(oView){
					return {};
				}
			},
			afterAction: fnConfirmSubSectionIsVisible.bind(null, "invisibleSubSection"),
			afterUndo: fnConfirmSubSectionIsInvisible.bind(null, "invisibleSubSection"),
			afterRedo: fnConfirmSubSectionIsVisible.bind(null, "invisibleSubSection")
		});
	});
})();