sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest",
	"sap/ui/core/util/reflection/XmlTreeModifier"
], function (elementActionTest, XmlTreeModifier) {

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
	elementActionTest("Checking the move action for a sap.uxap.ObjectPageSection control subsections", {
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

	function fnConfirmSection1IsOn2ndPosition(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("section1").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("op").getSections() [2].getId(),   // Id of second element in group after change has been applied
			"then the control has been moved to the right position");
	}
	function fnConfirmSection1IsOn1stPosition(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("section1").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("op").getSections() [0].getId(),   // Id of second element in group after change has been applied
			"then the control has been moved to the previous position");
	}

	// Use elementActionTest to check if a control is ready for the move action of UI adaptation
	elementActionTest("Checking the move action for a sap.uxap.ObjectPageSection control", {
		xmlView :
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="op">' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section1">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection1" title="Subsection with action buttons">' +
								'<uxap:actions>' +
									'<m:Button icon="sap-icon://synchronize" />' +
									'<m:Button icon="sap-icon://expand" />' +
								'</uxap:actions>' +
								'<m:Button text="Subsection UI adaptation" />' +
							'</uxap:ObjectPageSubSection>' +
						'</uxap:subSections>' +
					'</uxap:ObjectPageSection>' +
					'<uxap:ObjectPageSection id="section2">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection2" title="Subsection with action buttons">' +
								'<uxap:actions>' +
									'<m:Button icon="sap-icon://synchronize" />' +
									'<m:Button icon="sap-icon://expand" />' +
								'</uxap:actions>' +
								'<m:Button text="Subsection UI adaptation" />' +
							'</uxap:ObjectPageSubSection>' +
						'</uxap:subSections>' +
					'</uxap:ObjectPageSection>' +
					'<uxap:ObjectPageSection id="section3">' +
					'<uxap:subSections>' +
						'<uxap:ObjectPageSubSection id="subSection3" title="Subsection with action buttons">' +
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
			controlId : "op",
			parameter : function(oView){
				return {
					movedElements : [{
						element : oView.byId("section1"),
						sourceIndex : 1,
						targetIndex : 2
					}],
					source : {
						aggregation: "sections",
						parent: oView.byId("op")
					},
					target : {
						aggregation: "sections",
						parent: oView.byId("op")
					}
				};
			}
		},
		previousActions: [ // OPTIONAL
			{
				name : "move",
				controlId : "op",
				parameter : function(oView) {
					return {
						movedElements : [{
							element : oView.byId("section1"),
							sourceIndex : 0,
							targetIndex : 1
						}],
						source : {
							aggregation: "sections",
							parent: oView.byId("op")
						},
						target : {
							aggregation: "sections",
							parent: oView.byId("op")
						}
					};
				}
			}
		],
		changesAfterCondensing: 1, // OPTIONAL
		layer : "VENDOR",
		afterAction : fnConfirmSection1IsOn2ndPosition,
		afterUndo : fnConfirmSection1IsOn1stPosition,
		afterRedo : fnConfirmSection1IsOn2ndPosition,
		changeVisualization: function(oView) {
			return {
				displayElementId: "section1",
				info: {
					affectedControls: ["section1"],
					displayControls: ["section1", oView.byId("op").getAggregation("_anchorBar").getItems()[2].getId()]
				}
			};
		}
	});

	function fnConfirmIFrameSectionIsOn2ndPosition(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("iFrameSection").getId(),
			oViewAfterAction.byId("op").getSections()[1].getId(),
			"then the control has been moved to the right position");
	}
	function fnConfirmIFrameWasRemoved(oAppComponent, oViewAfterAction, assert) {
		assert.notOk( oViewAfterAction.byId("iFrameSection"),
			"then the iFrame is gone");
	}

	// Use elementActionTest to check if a new iFrame as a section is properly moved
	elementActionTest("Checking the move action for a sap.uxap.ObjectPageSection control after adding iFrame", {
		xmlView :
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="op">' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section1">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection1" title="Subsection with action buttons">' +
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
			controlId : "op",
			parameter : function(oView){
				return {
					movedElements : [{
						element : oView.byId("iFrameSection"),
						sourceIndex : 0,
						targetIndex : 1
					}],
					source : {
						aggregation: "sections",
						parent: oView.byId("op")
					},
					target : {
						aggregation: "sections",
						parent: oView.byId("op")
					}
				};
			}
		},
		previousActions: [ // OPTIONAL
			{
				name : "addIFrame",
				controlId : "op",
				parameter : function(oView) {
					return {
						baseId: oView.createId("iFrameSection"),
						targetAggregation: "sections",
						index: 0,
						url: "someUrl",
						width: "10px",
						height: "11px"
					};
				}
			}
		],
		changesAfterCondensing: 1, // OPTIONAL
		layer : "VENDOR",
		afterAction : fnConfirmIFrameSectionIsOn2ndPosition,
		afterUndo : fnConfirmIFrameWasRemoved,
		afterRedo : fnConfirmIFrameSectionIsOn2ndPosition,
		changeVisualization: function(oView) {
			return {
				displayElementId: oView.byId("iFrameSection").getId(),
				info: {
					affectedControls: [oView.byId("iFrameSection").getId()],
					displayControls: [oView.byId("iFrameSection").getId(), oView.byId("op").getAggregation("_anchorBar").getItems()[1].getId()]
				}
			};
		}
	});

	// Update IFrame
	function fnConfirmIFrameWasUpdated(oAppComponent, oViewAfterAction, assert) {
		const oIFrame = oViewAfterAction.byId("iFrameSection-iframe");
		assert.strictEqual(
			oIFrame.get_settings().url,
			"someNewUrl",
			"then the iframe url is updated"
		);
	}

	// Use elementActionTest to check if a new iFrame as Object Page Section is updated properly
	elementActionTest("Checking the update on a new iFrame added as Object Page Section", {
		xmlView :
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="op">' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section1">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection1" title="Subsection with action buttons">' +
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
			name : "settings",
			control : function(oView) {
				return oView.byId("iFrameSection-iframe");
			},
			parameter : function(){
				return {
					changeType: "updateIFrame",
					content: {
						height: "100%",
						url: "someNewUrl",
						width: "100%"
					}
				};
			}
		},
		previousActions: [ // OPTIONAL
			{
				name : "addIFrame",
				controlId : "op",
				parameter : function(oView) {
					return {
						baseId: oView.createId("iFrameSection"),
						targetAggregation: "sections",
						index: 0,
						url: "someUrl",
						width: "10px",
						height: "11px"
					};
				}
			}
		],
		changesAfterCondensing: 1, // OPTIONAL
		layer : "VENDOR",
		afterAction : fnConfirmIFrameWasUpdated,
		afterUndo : fnConfirmIFrameWasRemoved,
		afterRedo : fnConfirmIFrameWasUpdated
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
			'<uxap:ObjectPageLayout id="op">' +
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
		previousActions: [ // OPTIONAL
            {
                name: "rename",
                controlId: "section",
                parameter: function (oView) {
                    return {
                        newValue: 'Intermediate Value',
                        renamedElement: oView.byId("section")
                    };
                }
            }
        ],
        changesAfterCondensing: 1, // OPTIONAL
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
				return oView.byId("layout").getAggregation("_anchorBar").getItems()[0];
			},
			parameter: function (oView) {
				return {
					newValue: 'Title 2',
					renamedElement: oView.byId("layout").getAggregation("_anchorBar").getItems()[0]
				};
			}
		},
		afterAction: fnConfirmSectionRenamedWithNewValue,
		afterUndo: fnConfirmSectionIsRenamedWithOldValue,
		afterRedo: fnConfirmSectionRenamedWithNewValue,
		changeVisualization: function(oView) {
			return {
				displayElementId: "section",
				info: {
					affectedControls: ["section"],
					displayControls: ["section", oView.byId("layout").getAggregation("_anchorBar").getItems()[0].getId()]
				}
			};
		}
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
	function confirmSectionRenameWithOneSubSectionApplied(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
			"SubSectionTitle 2",
			"then the SubSection's title has been renamed with the new value");
	}

	function confirmSectionRenameWithOneSubSectionReverted(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(),
			"SubSectionTitle 1",
			"then the SubSection's title has been reverted to the old value");
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
		// If the Section only has one SubSection, the Section takes the SubSection title
		label: "SubSectionTitle 1",
		action: {
			name: "rename",
			controlId: "section",
			parameter: function (oView) {
				return {
					newValue: "SubSectionTitle 2",
					renamedElement: oView.byId("section")
				};
			}
		},
		afterAction: confirmSectionRenameWithOneSubSectionApplied,
		afterUndo: confirmSectionRenameWithOneSubSectionReverted,
		afterRedo: confirmSectionRenameWithOneSubSectionApplied
	});

	// Rename section with one subsection with title
	function confirmSectionRenameWithOneSubSectionAppliedWithBinding(oAppComponent, oViewAfterAction, assert) {
		var oTitleBindingInfo = oViewAfterAction.byId("subSection").getBindingInfo("title");
		assert.notOk(oTitleBindingInfo, "then no binding info is present for the control's title");
		assert.strictEqual(oViewAfterAction.byId("subSection").getTitle(), "SubSectionTitle 2", "then the SubSection's title has been renamed with the new value");
	}

	function confirmSectionRenameWithOneSubSectionRevertedWithBinding(oAppComponent, oViewAfterAction, assert) {
		var oTitleBindingInfo = oViewAfterAction.byId("subSection").getBindingInfo("title");
		assert.strictEqual(oTitleBindingInfo.parts[0].path, "propertyName", "then the binding path has been reverted");
		assert.strictEqual(oTitleBindingInfo.parts[0].model, "modelName", "then the binding model has been reverted");
	}
	elementActionTest("Checking the rename action for a Section having one SubSection with title binding", {
		xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout>' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section" title="Title 1">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection" title="{modelName>propertyName}">' +
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
					newValue: "SubSectionTitle 2",
					renamedElement: oView.byId("section")
				};
			}
		},
		afterAction: confirmSectionRenameWithOneSubSectionAppliedWithBinding,
		afterUndo: confirmSectionRenameWithOneSubSectionRevertedWithBinding,
		afterRedo: confirmSectionRenameWithOneSubSectionAppliedWithBinding
	});

	// Rename action of section with one subsection with title binding"
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
				return oView.byId("layout").getAggregation("_anchorBar").getItems()[0];
			},
			parameter: function (oView) {
				return {
					removedElement: oView.byId("layout").getAggregation("_anchorBar").getItems()[0]
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
				return oView.byId("layout").getAggregation("_anchorBar").getItems()[0];
			}
		},
		afterAction: fnConfirmSectionIsVisible,
		afterUndo: fnConfirmSectionIsNotVisible,
		afterRedo: fnConfirmSectionIsVisible
	});

	elementActionTest("Checking the unstash action for a Section with only one subsection from the corresponding anchor bar button", {
		xmlView:'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
			'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
				'<uxap:ObjectPageLayout id="layout">' +
					'<uxap:sections>' +
						'<uxap:ObjectPageSection id="section" visible="false" title="Title 1">' +
							'<uxap:subSections>' +
								'<uxap:ObjectPageSubSection id="subSection1" title="SubSection Title 1">' +
									'<m:Button text="Subsection UI adaptation1" />' +
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
				return oView.byId("layout").getAggregation("_anchorBar").getItems()[0];
			},
			label: "SubSection Title 1"
		},
		afterAction: fnConfirmSectionIsVisible,
		afterUndo: fnConfirmSectionIsNotVisible,
		afterRedo: fnConfirmSectionIsVisible,
		changeVisualization: function(oView) {
			return {
				displayElementId: "section",
				info: {
					affectedControls: ["section"],
					displayControls: ["section", oView.byId("layout").getAggregation("_anchorBar").getItems()[0].getId()]
				}
			};
		}
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
});