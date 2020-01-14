/*global QUnit */

sap.ui.define([
	"sap/ui/rta/enablement/elementActionTest",
	'sap/uxap/ObjectPageLayout',
	'sap/uxap/ObjectPageSection',
	'sap/uxap/ObjectPageSubSection',
	'sap/ui/layout/HorizontalLayout',
	'sap/m/Button',
	'sap/ui/dt/DesignTime',
	'sap/ui/rta/command/CommandFactory',
	'sap/ui/rta/plugin/DragDrop',
	'sap/ui/rta/plugin/CutPaste',
	"sap/ui/rta/plugin/RTAElementMover",
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/thirdparty/sinon-4'
], function (
	elementActionTest,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	HorizontalLayout,
	Button,
	DesignTime,
	CommandFactory,
	DragDropPlugin,
	CutPastePlugin,
	RTAElementMover,
	OverlayRegistry,
	sinon
) {
	"use strict";

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

	// Use elementActionTest to check if a control is ready for the move action of UI adaptation
	elementActionTest("Checking the move action for a sap.uxap.ObjectPage control in headerContent", {
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

	var fnConfirmSection1IsOn2ndPosition = function(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("section").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("layout").getSections()[1].getId(),   // Id of second element in group after change has been applied
			"then the section has been moved to the right position");
	};
	var fnConfirmSection1IsOn1stPosition = function(oAppComponent, oViewAfterAction, assert) {
		assert.strictEqual( oViewAfterAction.byId("section").getId(),       // Id of element at first position in original view
			oViewAfterAction.byId("layout").getSections()[0].getId(),   // Id of second element in group after change has been applied
			"then the section has been moved to the previous position");
	};

	// Check moving sections
	elementActionTest("Checking the move action for a sap.uxap.ObjectPageSection control", {
		xmlView :
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="layout">' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection" title="Subsection with button">' +
								'<m:Button text="Button" />' +
							'</uxap:ObjectPageSubSection>' +
							'<uxap:ObjectPageSubSection id="subSection1" title="Subsection empty">' +
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
		'</mvc:View>',
		action : {
			name : "move",
			controlId : "section",
			parameter : function(oView){
				return {
					movedElements : [{
						element : oView.byId("section"),
						sourceIndex : 0,
						targetIndex : 1
					}],
					source : {
						aggregation: "sections",
						parent: oView.byId("layout")
					},
					target : {
						aggregation: "sections",
						parent: oView.byId("layout")
					}
				};
			}
		},
		layer : "VENDOR",
		afterAction : fnConfirmSection1IsOn2ndPosition,
		afterUndo : fnConfirmSection1IsOn1stPosition,
		afterRedo : fnConfirmSection1IsOn2ndPosition
	});

	// check moving anchors
	elementActionTest("Checking the move action for sections based on the internal anchor bar", {
		xmlView :
		'<mvc:View xmlns:mvc="sap.ui.core.mvc" ' +
		'xmlns:m="sap.m" xmlns:uxap="sap.uxap" >' +
			'<uxap:ObjectPageLayout id="layout">' +
				'<uxap:sections>' +
					'<uxap:ObjectPageSection id="section">' +
						'<uxap:subSections>' +
							'<uxap:ObjectPageSubSection id="subSection" title="Subsection with button">' +
								'<m:Button text="Button" />' +
							'</uxap:ObjectPageSubSection>' +
							'<uxap:ObjectPageSubSection id="subSection1" title="Subsection empty">' +
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
		'</mvc:View>',
		action : {
			name : "move",
			control : function(oView) {
				return oView.byId("layout").getAggregation("_anchorBar").getContent()[0];
			},
			parameter : function(oView){
				return {
					movedElements : [{
						element : oView.byId("layout").getAggregation("_anchorBar").getContent()[0],
						sourceIndex : 0,
						targetIndex : 1
					}],
					source : {
						aggregation: "_anchorBar",
						parent: oView.byId("layout").getAggregation("_anchorBar")
					},
					target : {
						aggregation: "_anchorBar",
						parent: oView.byId("layout").getAggregation("_anchorBar")
					}
				};
			}
		},
		afterAction : fnConfirmSection1IsOn2ndPosition,
		afterUndo : fnConfirmSection1IsOn1stPosition,
		afterRedo : fnConfirmSection1IsOn2ndPosition
	});

	QUnit.module("Given ObjectPageLayout with Sections and headerContent,", {
		beforeEach : function(assert) {

			// ObjectPageLayout
			//    headerContent
			//        HorizontalLayout
			//    sections
			//        visible ObjectPageSection based on ux rules
			//        visible ObjectPageSection based on ux rules

			this.oObjectPageSection = new ObjectPageSection("movedSection", {
				title: "makeMeVisible1",
				subSections: [new ObjectPageSubSection({
					blocks: [new Button({text: "makeMeVisible1"})]
				})]
			});
			this.oHorizontalLayout = new HorizontalLayout("horizontalLayout");
			this.oObjectPageLayout = new ObjectPageLayout("layout", {
				headerContent : [this.oHorizontalLayout],
				sections : [this.oObjectPageSection,
					new ObjectPageSection("otherSection", {
						title: "makeMeVisible2",
						subSections: [new ObjectPageSubSection({
							blocks: [new Button({text: "makeMeVisible2"})]
						})]
					})]
			});

			var oCommandFactory = new CommandFactory();
			this.oDragDropPlugin = new DragDropPlugin({
				commandFactory : oCommandFactory
			});

			this.oObjectPageLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oObjectPageLayout
				],
				plugins: [this.oDragDropPlugin]
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oHeaderContentAggregationOverlay = OverlayRegistry.getOverlay(this.oObjectPageLayout).getAggregationOverlay("headerContent");
				this.oElementMover = this.oDragDropPlugin.getElementMover();
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oDesignTime.destroy();
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("when DT is loaded and trying to move the section into the headerContent...", function(assert) {
		var oMovedSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
		this.oElementMover.setMovedOverlay(oMovedSectionOverlay);
		return this.oElementMover.checkTargetZone(this.oHeaderContentAggregationOverlay)
			.then(function(bTargetZone) {
				assert.notOk(bTargetZone,
					"then the headerContent aggregation is not a possible target zone");
			});
	});

	QUnit.test("when DT is loaded and trying to move the anchor representation of a section into the headerContent...", function(assert) {
		var oMovedAnchorBarButton = this.oObjectPageLayout.getAggregation("_anchorBar").getContent()[0];
		var oMovedAnchorBarButtonOverlay = OverlayRegistry.getOverlay(oMovedAnchorBarButton);
		this.oElementMover.setMovedOverlay(oMovedAnchorBarButtonOverlay);
		return this.oElementMover.checkTargetZone(this.oHeaderContentAggregationOverlay)
			.then(function(bTargetZone) {
				assert.notOk(bTargetZone,
					"then the headerContent aggregation is not a possible target zone");
			});
	});

	QUnit.module("Given ObjectPageLayout with two Sections,", {
		beforeEach : function(assert) {

			// ObjectPageLayout
			//    sections
			//        section1
			//        section2

			var oSubSection = new ObjectPageSubSection("subsection", {
				blocks: [new Button({text: "abc"})]
			});
			var oSubSection2 = new ObjectPageSubSection("subsection2", {
				blocks: [new Button({text: "def"})]
			});
			this.oObjectPageSection1 = new ObjectPageSection("section1", {
				subSections: [oSubSection]
			});
			this.oObjectPageSection2 = new ObjectPageSection("section2", {
				subSections: [oSubSection2]
			});
				this.oHorizontalLayout = new HorizontalLayout("horizontalLayout");
			this.oObjectPageLayout = new ObjectPageLayout("layout", {
				sections : [this.oObjectPageSection1, this.oObjectPageSection2],
				showHeaderContent: false,
				height: "150px"
			});

			var oCommandFactory = new CommandFactory();
			var oRTAElementMover = new RTAElementMover({
				commandFactory: oCommandFactory
			});
			this.oCutPastePlugin = new CutPastePlugin({
				elementMover: oRTAElementMover,
				commandFactory : oCommandFactory
			});

			this.oObjectPageLayout.placeAt("content");
			sap.ui.getCore().applyChanges();

			// create designtime
			this.oDesignTime = new DesignTime({
				rootElements: [
					this.oObjectPageLayout
				],
				plugins: [this.oCutPastePlugin]
			});

			var done = assert.async();
			this.oDesignTime.attachEventOnce("synced", function() {
				this.oMovedSectionOverlay1 = OverlayRegistry.getOverlay(this.oObjectPageSection1);
				this.oMovedSectionOverlay2 = OverlayRegistry.getOverlay(this.oObjectPageSection2);
				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oDesignTime.destroy();
			this.oObjectPageLayout.destroy();
		}
	});

	QUnit.test("when dt is loaded and a section is moved", function(assert) {
		var done = assert.async();

		var oScrollSpy = sinon.spy(this.oObjectPageLayout._oScroller, "scrollTo");

		this.oCutPastePlugin.cut(this.oMovedSectionOverlay1);
		this.oCutPastePlugin.paste(this.oMovedSectionOverlay2);

		// This operation is done asynchronously
		setTimeout(function() {
			assert.equal(oScrollSpy.callCount, 0, "the layout doesn't scroll");
			done();
		}, 0);
	});

	QUnit.module("Framework API overrides");

	QUnit.test("clone()", function (assert) {
		var bNoException = true;

		try {
			var o = new ObjectPageLayout();
			o.clone();
		} catch (e) {
			bNoException = false;
		}

		assert.ok(bNoException, "should throw no exceptions when called on a freshly instantiated ObjectPageLayout");
	});

	QUnit.module("Layout calculations", {
		beforeEach : function() {
			this.oSimpleObjectPageLayout = new ObjectPageLayout();
		},
		afterEach : function() {
			this.oSimpleObjectPageLayout.destroy();
		}
	});

	QUnit.test("Width calculation after rendering inside hidden parent element", function (assert) {
		var iWidth,
			oParentNode = document.getElementById("content");

		//hiding parent element
		oParentNode.style.display = "none";
		this.oSimpleObjectPageLayout.placeAt("content");
		sap.ui.getCore().applyChanges();
		iWidth = this.oSimpleObjectPageLayout._getWidth(this.oSimpleObjectPageLayout);

		assert.equal(iWidth, 0, "The width of the DOM Element is calculated correctly");
		//returning visibility of the parent element
		oParentNode.style.display = "block";
	});
});
