(function () {
	"use strict";

	sap.ui.require([
		"sap/ui/rta/test/controlEnablingCheck"
	], function (rtaControlEnablingCheck) {

		var fnConfirmGroupelement1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("subSection").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("section").getSubSections() [1].getId(),   // Id of second element in group after change has been applied
				"then the control has been moved to the right position");
		};
		var fnConfirmGroupelement1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
			assert.strictEqual( oViewAfterAction.byId("subSection").getId(),       // Id of element at first position in original view
				oViewAfterAction.byId("section").getSubSections() [0].getId(),   // Id of second element in group after change has been applied
				"then the control has been moved to the previous position");
		};

		// Use rtaControlEnablingCheck to check if a control is ready for the move action of UI adaptation
		rtaControlEnablingCheck("Checking the move action for a sap.uxap.ObjectPageSection control", {
			xmlView :
			'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
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
								'<uxap:ObjectPageSubSection id="subSection1" title="Subsection with action buttons">' +
									'<uxap:actions>' +
										'<m:Button icon="sap-icon://synchronize" />' +
										'<m:Button icon="sap-icon://expand" />' +
									'</uxap:actions>' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>',
			action : {
				name : "move",
				controlId : "section",
				parameter : function(oView){
					return {
						movedElements : [{
							element : oView.byId("subSection"),
							sourceIndex : 0,
							targetIndex : 1
						}],
						source : {
							aggregation: "subSections",
							parent: oView.byId("section")
						},
						target : {
							aggregation: "subSections",
							parent: oView.byId("section")
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
		var fnConfirmSectionRenamedWithNewValue = function (oSection, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
				"Title 2",
				"then the control has been renamed to the new value (Title 2)");
		};

		var fnConfirmSectionIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
				"Title 1",
				"then the control has been renamed to the old value (Title 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Section", {
			xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection id="section" title="Title 1">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection1">' +
									'<m:Button text="Subsection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
									'<uxap:ObjectPageSubSection id="subSection2">' +
										'<m:Button text="Subsection UI adaptation" />' +
									'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "section",
				parameter: function (oView) {
					return {
						newValue: 'Title 2',
						renamedElement: oView.byId("section")
					};
				}
			},
			afterAction: fnConfirmSectionRenamedWithNewValue,
			afterUndo: fnConfirmSectionIsRenamedWithOldValue,
			afterRedo: fnConfirmSectionRenamedWithNewValue
		});

			// Rename action of section with one subsection with NO title
			rtaControlEnablingCheck("Checking the rename action for a Section, with one SubSection, without title ", {
				xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
				'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
					'<uxap:ObjectPageLayout>' +
						'<uxap:sections>' +
							'<uxap:ObjectPageSection id="section" title="Title 1">' +
								'<uxap:subSections>' +
									'<uxap:ObjectPageSubSection id="subSection1">' +
										'<m:Button text="Subsection UI adaptation" />' +
									'</uxap:ObjectPageSubSection>' +
								'</uxap:subSections>' +
							'</uxap:ObjectPageSection>' +
						'</uxap:sections>' +
					'</uxap:ObjectPageLayout>' +
				'</mvc:View>'
				,
				action: {
					name: "rename",
					controlId: "section",
					parameter: function (oView) {
						return {
							newValue: 'Title 2',
							renamedElement: oView.byId("section")
						};
					}
				},
				afterAction: fnConfirmSectionRenamedWithNewValue,
				afterUndo: fnConfirmSectionIsRenamedWithOldValue,
				afterRedo: fnConfirmSectionRenamedWithNewValue
			});

		// Rename section with one subsection with title
		var fnConfirmSubSectionRenamedWithOneSectionNewValue = function (oSection, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
				"SubSectionTitle 2",
				"then the SubSection control has been renamed to the new value (SubSectionTitle 2)");
		};

		var fnConfirmSubSectionRenamedWithOneSectionOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
				"SubSectionTitle 1",
				"then the SubSection control has been renamed to the old value (SubSectionTitle 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Section with one SubSection with title", {
			xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout>' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection id="section" title="Title 1">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection" title="SubSectionTitle 1">' +
									'<m:Button text="Subsection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "section",
				parameter: function (oView) {
					return {
						newValue: 'SubSectionTitle 2',
						renamedElement: oView.byId("section")
					};
				}
			},
			afterAction: fnConfirmSubSectionRenamedWithOneSectionNewValue,
			afterUndo: fnConfirmSubSectionRenamedWithOneSectionOldValue,
			afterRedo: fnConfirmSubSectionRenamedWithOneSectionNewValue
		});

		// Rename action of section with one subsection with title and layout parameter subSectionLayout="TitleOnLeft"
		var fnConfirmSubSectionRenamedLayoutParameterNewValue = function (oSection, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
				"Title 2",
				"then the Section control has been renamed to the new value (Title 2)");
		};

		var fnConfirmSubSectionIsRenamedLayoutParameterOldValue = function (oUiComponent, oViewAfterAction, assert) {
			assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
				"Title 1",
				"then the Section control has been renamed to the old value (Title 1)");
		};

		rtaControlEnablingCheck("Checking the rename action for a Section with one SubSection with title, when subSectionLayout='TitleOnLeft' ", {
			xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout subSectionLayout="TitleOnLeft">' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection id="section" title="Title 1">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection" title="SubSectionTitle 1">' +
									'<m:Button text="Subsection UI adaptation" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
			,
			action: {
				name: "rename",
				controlId: "section",
				parameter: function (oView) {
					return {
						newValue: 'Title 2',
						renamedElement: oView.byId("section")
					};
				}
			},
			afterAction: fnConfirmSubSectionRenamedLayoutParameterNewValue,
			afterUndo: fnConfirmSubSectionIsRenamedLayoutParameterOldValue,
			afterRedo: fnConfirmSubSectionRenamedLayoutParameterNewValue
		});
	});
})();