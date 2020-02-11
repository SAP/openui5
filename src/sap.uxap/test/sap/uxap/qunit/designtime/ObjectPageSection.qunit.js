/*global QUnit*/

sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/core/util/reflection/XmlTreeModifier"
], function (elementActionTest, ChangeRegistry, XmlTreeModifier) {

	"use strict";

	function fnConfirmGroupelement1IsOn2ndPosition(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("subSection").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("section").getSubSections() [1].getId(),   // Id of second element in group after change has been applied
			"then the control has been moved to the right position");
	}
	function fnConfirmGroupelement1IsOn1stPosition(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("subSection").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("section").getSubSections() [0].getId(),   // Id of second element in group after change has been applied
			"then the control has been moved to the previous position");
	}

	// Use elementActionTest to check if a control is ready for the move action of UI adaptation
	elementActionTest("Checking the move action for a sap.uxap.ObjectPageSection control", {
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
	var fnConfirmSectionRenamedWithNewValue = function (oUIComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
			"Title 2",
			"then the control has been renamed to the new value (Title 2)");
	};

	var fnConfirmSectionIsRenamedWithOldValue = function (oUiComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
			"Title 1",
			"then the control has been renamed to the old value (Title 1)");
	};

	elementActionTest("Checking the rename action for a Section", {
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

	// Rename section from anchor bar button
	elementActionTest("Checking the rename action for a Section from the corresponding anchor bar button", {
		xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout id="layout">' +
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
						'<uxap:ObjectPageSection id="section2">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection3" title="Subsection3 with button">' +
									'<m:Button text="Button2" />' +
								'</uxap:ObjectPageSubSection>' +
								'<uxap:ObjectPageSubSection id="subSection4" title="Subsection4 empty">' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
		,
		action: {
			name: "rename",
			control : function(oView) {
				return oView.byId("layout").getAggregation("_anchorBar").getContent()[0];
			},
			parameter: function (oView) {
				return {
					newValue: 'Title 2',
					renamedElement: oView.byId("layout").getAggregation("_anchorBar").getContent()[0]
				};
			}
		},
		afterAction: fnConfirmSectionRenamedWithNewValue,
		afterUndo: fnConfirmSectionIsRenamedWithOldValue,
		afterRedo: fnConfirmSectionRenamedWithNewValue
	});

	// Rename action of section with one subsection with NO title
	elementActionTest("Checking the rename action for a Section, with one SubSection, without title ", {
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
	function fnConfirmSubSectionRenamedWithOneSectionNewValue(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
			"SubSectionTitle 2",
			"then the SubSection control has been renamed to the new value (SubSectionTitle 2)");
	}

	function fnConfirmSubSectionRenamedWithOneSectionOldValue(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
			"SubSectionTitle 1",
			"then the SubSection control has been renamed to the old value (SubSectionTitle 1)");
	}

	elementActionTest("Checking the rename action for a Section with one SubSection with title", {
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
	function fnConfirmSubSectionRenamedLayoutParameterNewValue(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
			"Title 2",
			"then the Section control has been renamed to the new value (Title 2)");
	}

	function fnConfirmSubSectionIsRenamedLayoutParameterOldValue(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("section").getTitle(),
			"Title 1",
			"then the Section control has been renamed to the old value (Title 1)");
	}

	// Remove action from anchor bar button
	function fnConfirmSectionIsNotVisible(oAppComponent, oView, assert) {
		var aSections = oView.byId("layout").getSections();
		var iSectionLength = aSections.length;
		if (iSectionLength === 2) {
			assert.equal(aSections[0].getId(), oView.createId("section2"));
			assert.equal(aSections[1].getId(), oView.createId("section3"));
		} else {
			assert.equal(aSections[0].getId(), oView.createId("section"));
			assert.equal(aSections[0].getVisible(), false);
		}
	}

	function fnConfirmSectionIsVisible(oAppComponent, oView, assert) {
		var aSections = oView.byId("layout").getSections();
		var iSectionLength = aSections.length;
		assert.equal(iSectionLength, 3);
		aSections.forEach(function(oSection) {
			assert.equal(oSection.getVisible(), true);
		});
	}

	elementActionTest("Checking the stash action for a Section from the corresponding anchor bar button", {
		xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout id="layout">' +
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
						'<uxap:ObjectPageSection id="section2">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection3" title="Subsection3 with button">' +
									'<m:Button text="Button1" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="section3">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection4" title="Subsection4 with button">' +
									'<m:Button text="Button2" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
		,
		action: {
			name: "remove",
			control : function(oView) {
				return oView.byId("layout").getAggregation("_anchorBar").getContent()[0];
			},
			parameter: function (oView) {
				return {
					removedElement: oView.byId("layout").getAggregation("_anchorBar").getContent()[0]
				};
			}
		},
		afterAction: fnConfirmSectionIsNotVisible,
		afterUndo: fnConfirmSectionIsVisible,
		afterRedo: fnConfirmSectionIsNotVisible
	});

	elementActionTest("Checking the unstash action for a Section from the corresponding anchor bar button", {
		xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout id="layout">' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection id="section" visible="false" title="Title 1">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection1">' +
									'<m:Button text="Subsection UI adaptation1" />' +
								'</uxap:ObjectPageSubSection>' +
								'<uxap:ObjectPageSubSection id="subSection2">' +
									'<m:Button text="Subsection UI adaptation2" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="section2">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection3" title="Subsection3 with button">' +
									'<m:Button text="Button1" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
						'<uxap:ObjectPageSection id="section3">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection4" title="Subsection4 with button">' +
									'<m:Button text="Button2" />' +
								'</uxap:ObjectPageSubSection>' +
							'</uxap:subSections>' +
						'</uxap:ObjectPageSection>' +
					'</uxap:sections>' +
				'</uxap:ObjectPageLayout>' +
			'</mvc:View>'
		,
		action: {
			revealedElement: function(oView) {
				return oView.byId("section");
			},
			name: "reveal",
			control : function(oView) {
				return oView.byId("layout").getAggregation("_anchorBar").getContent()[0];
			}
		},
		afterAction: fnConfirmSectionIsVisible,
		afterUndo: fnConfirmSectionIsNotVisible,
		afterRedo: fnConfirmSectionIsVisible
	});

	elementActionTest("Checking the rename action for a Section with one SubSection with title, when subSectionLayout='TitleOnLeft' ", {
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

	QUnit.module("We have a _StashedControl before a section gets unstashed...", {
		beforeEach : function(assert) {
			this.oChangeRegistry = ChangeRegistry.getInstance();
		}
	});

	QUnit.test("then for the _StashedControl control", function(assert) {
		assert.ok(
			this.oChangeRegistry.getChangeHandler("stashControl", "sap.ui.core._StashedControl", null, XmlTreeModifier),
			"there is a change handler for changetype stashControl"
		);
		assert.ok(
			this.oChangeRegistry.getChangeHandler("unstashControl", "sap.ui.core._StashedControl", null, XmlTreeModifier),
			"there is a change handler for changetype unstashControl"
		);
	});

});