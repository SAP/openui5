/* global QUnit*/

QUnit.dump.maxDepth = 50;

sap.ui.define([
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/registry/ExtensionPointRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/Page",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/UIComponent",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/mvc/XMLView",
	"testdata/StaticDesigntimeMetadata",
	"sap/ui/thirdparty/sinon-4"
], function (
	RuntimeAuthoring,
	Plugin,
	CommandFactory,
	OverlayRegistry,
	DesignTime,
	PersistenceWriteAPI,
	ExtensionPointRegistry,
	VerticalLayout,
	Button,
	Page,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	UIComponent,
	ComponentContainer,
	XMLView,
	StaticDesigntimeMetadata,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that RuntimeAuthoring and Outline service are created and get function is called", {
		before: function(assert) {
			QUnit.config.fixture = null;
			var done = assert.async();
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion : {
								version : "1.2.3"
							}
						}
					}
				},
				createContent: function() {
					return new Page("mainPage");
				}
			});

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oComp = new MockComponent("testComponent");

			this.oPage = this.oComp.getRootControl();

			// --Root control 1
			//	page
			//		objectPageLayout
			//			objectPageSection (sections)
			//				objectPageSubSection
			//					verticalLayout
			//						button
			this.oPage.addContent(
				this.oObjectPageLayout = new ObjectPageLayout({
					id: "objPage",
					sections: [
						this.oObjectPageSection = new ObjectPageSection({
							id: "objSection",
							title: "Section Title",
							subSections: [
								this.oObjectPageSubSection = new ObjectPageSubSection({
									id: "objSubSection",
									title: "Subsection Title",
									blocks: [
										this.oLayout = new VerticalLayout({
											id: "layout1",
											content: [
												this.oButton1 = new Button("button1")
											]
										})
									]
								})
							]
						})
					]
				})
			);

			// --Root control 2
			//	verticalLayout
			//		button
			this.oOuterLayout = new VerticalLayout({
				id: "layout2",
				content: [
					this.oButton2 = new Button("button2"),
					new VerticalLayout({
						id: "layout3",
						content: [
							new Button({
								id: "button3",
								visible: true // visible control inside a hidden control
							})
						],
						visible: false
					})
				]
			});
			this.oOuterLayout.placeAt('qunit-fixture');

			this.oComponentContainer = new ComponentContainer({
				id: "CompCont",
				component: this.oComp,
				height: "100%"
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComponentContainer
			});

			// check designtime metadata label property
			var oExtendedDesigntimeMetadataForLayout = StaticDesigntimeMetadata.getVerticalLayoutDesigntimeMetadata();
			oExtendedDesigntimeMetadataForLayout.getLabel = function(oLayout) {
				if (oLayout === this.oLayout) {
					return "Vertical Layout Label";
				}
			}.bind(this);

			sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor")

			.withArgs(this.oPage).returns(StaticDesigntimeMetadata.getPageDesigntimeMetadata())
			.withArgs(this.oButton1).returns(StaticDesigntimeMetadata.getButtonDesigntimeMetadata())
			.withArgs(this.oLayout).returns(oExtendedDesigntimeMetadataForLayout)
			.withArgs(this.oObjectPageSubSection).returns(StaticDesigntimeMetadata.getObjectPageSubSectionDesigntimeMetadata())
			.withArgs(this.oObjectPageSection).returns(StaticDesigntimeMetadata.getObjectPageSectionDesigntimeMetadata())
			.withArgs(this.oObjectPageLayout).returns(StaticDesigntimeMetadata.getObjectPageLayoutDesigntimeMetadata())
			.withArgs(this.oButton2).returns(StaticDesigntimeMetadata.getButtonDesigntimeMetadata())
			.withArgs(this.oOuterLayout).returns(StaticDesigntimeMetadata.getVerticalLayoutDesigntimeMetadata());

			this.oRta.getService("outline").then(function (oService) {
				var fnElementOverlayCreatedHandler = function(oEvt) {
					if (oEvt.getParameters().elementOverlay.getElement().getId() === "layout2") {
						// Overlays for second root element created
						this.oRta._oDesignTime.detachEvent("elementOverlayCreated", fnElementOverlayCreatedHandler, this);
						done();
					}
				};
				this.oRta._oDesignTime.attachEvent("elementOverlayCreated", fnElementOverlayCreatedHandler, this);
				this.oOutline = oService;
				var oPageOverlay = OverlayRegistry.getOverlay(this.oPage);
				oPageOverlay.setEditable(true);
				this.oRta._oDesignTime.addRootElement(this.oOuterLayout);
			}.bind(this));

			this.oRta.start();
		},
		after: function() {
			QUnit.config.fixture = '';
			this.oRta.destroy();
			this.oComponentContainer.destroy();
			this.oOuterLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when get() is called and and no parameter is passed for initial control id and depth", function (assert) {
			var done = assert.async();
			jQuery.getJSON("test-resources/sap/ui/rta/qunit/service/Outline.json", function(aExpectedOutlineData) {
				var aRootElements = this.oRta._oDesignTime.getRootElements();
				this.oOutline.get().then(function(aReceivedResponse) {
					assert.ok(Array.isArray(aReceivedResponse), "then an array is received");
					assert.equal(aReceivedResponse.length, 2, "then two items in the array for each root element");
					assert.strictEqual(aReceivedResponse[0].id, aRootElements[0].getId(), "then outline for first item created starting from the first root element");
					assert.strictEqual(aReceivedResponse[1].id, aRootElements[1].getId(), "then outline for second created starting from the second root element");
					assert.deepEqual(aReceivedResponse, aExpectedOutlineData, "then expected outline data received");
					done();
				});
			}.bind(this));
		});

		QUnit.test("when get() is called and and depth (3) is passed without initial control id", function (assert) {
			var aRootElements = this.oRta._oDesignTime.getRootElements();
			return this.oOutline.get(3).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, aRootElements[0].getId(), "then outline for first item created starting from the first root element");

				assert.ok(Array.isArray(aReceivedResponse[0].elements), "then first level children are returned");
				var bDepthLevelsCovered = aReceivedResponse[0].elements.some(function(oChild1) {
					if (oChild1.technicalName === "component") { // component aggregation of ComponentContainer
						assert.ok(Array.isArray(oChild1.elements), "then second level children are returned");

						var oChild2 = oChild1.elements[0]; // Component
						assert.ok(Array.isArray(oChild2.elements), "then third level children are returned");

						return oChild2.elements.some(function (oChild3) {
							if (oChild3.technicalName === "rootControl") { // rootControl aggregation of Component
								assert.notOk(oChild3.elements, "then fourth level children are not returned");
								return true;
							}
						});
					}
				});

				assert.ok(bDepthLevelsCovered, "all node depth levels are covered");
			});
		});

		QUnit.test("when get() is called and initial control id is passed without depth", function (assert) {
			return this.oOutline.get("layout2").then(function(aReceivedResponse) {
				assert.ok(aReceivedResponse[0], "then only one item applicable to the passed parameter returned");
				assert.strictEqual(aReceivedResponse[0].id, "layout2", "then outline for first root element tree starts from the passed overlay");
			});
		});

		QUnit.test("when get() is called and invalid control id is passed", function (assert) {
			return this.oOutline.get("dummy").catch(function(oError) {
				assert.ok(oError.message.indexOf("Cannot find element with id= dummy") > -1, "then the correct error is thrown");
			});
		});

		QUnit.test("when get() is called and both initial control id and depth (2) are passed", function (assert) {
			return this.oOutline.get("objPage", 2).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, "objPage", "then outline for first item created starting from the passed overlay");

				assert.ok(Array.isArray(aReceivedResponse[0].elements), "then first level children are returned");
				var bDepthLevelsCovered = aReceivedResponse[0].elements.some(function(oChild1) {
					if (oChild1.technicalName === "sections") { // object page sections
						assert.ok(Array.isArray(oChild1.elements), "then second level children are returned");

						var oChild2 = oChild1.elements[0]; // object page sub section
						assert.notOk(oChild2.elements, "then third level children are not returned");
						return true;
					}
				});

				assert.ok(bDepthLevelsCovered, "all node depth levels are covered");
			});
		});

		QUnit.test("when get() is called with initial control id and depth (2), but second level overlay is being destroyed", function (assert) {
			var oObjectPageSectionOverlay = OverlayRegistry.getOverlay(this.oObjectPageSection);
			sandbox.stub(oObjectPageSectionOverlay, "getShouldBeDestroyed").returns(true);
			return this.oOutline.get("objPage", 2).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, "objPage", "then outline for first item created starting from the passed overlay");

				assert.ok(Array.isArray(aReceivedResponse[0].elements), "then first level children are returned");
				var bDepthLevelsCovered = aReceivedResponse[0].elements.some(function(oChild1) {
					if (oChild1.technicalName === "sections") { // object page sections
						assert.equal(oChild1.elements.length, 0, "then second level children are not returned");
						return true;
					}
				});

				assert.ok(bDepthLevelsCovered, "all node depth levels are covered");
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring and Outline service are created and get function is called", {
		before: function () {

		},
		beforeEach: function(assert) {
			var done = assert.async();
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion : {
								version : "1.2.3"
							}
						}
					}
				},
				createContent: function() {
					return new Page("mainPage");
				}
			});

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfo").resolves({
				isResetEnabled: true,
				isPublishEnabled: true
			});

			this.oComp = new MockComponent("testComponent");
			this.oPage = this.oComp.getRootControl();

			// --Root control
			//	page
			//		verticalLayout
			//			button

			this.oButton = new Button({
				id: "button",
				text: "Button 1"
			});
			this.oButton1 = new Button({
				id: "button1",
				text: "Button 2"
			});

			this.oLayout = new VerticalLayout({
				id: "layout0",
				content : [this.oButton]
			});

			this.oLayout1 = new VerticalLayout({
				id: "layout1",
				content : [this.oButton1]
			});

			this.oPage.addContent(this.oLayout);
			this.oPage.addContent(this.oLayout1);

			var oPlugin = new Plugin({});
			oPlugin.isEditable = function() { return false; };

			this.oComponentContainer = new ComponentContainer({
				id: "CompCont",
				component: this.oComp,
				height: "100%"
			});
			this.oComponentContainer.placeAt('qunit-fixture');
			sap.ui.getCore().applyChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oComponentContainer,
				showToolbars: false,
				plugins: { testPlugin: oPlugin }
			});

			this.oRta.getService("outline").then(function (oService) {
				this.oOutline = oService;
				done();
			}.bind(this));

			this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			this.oComponentContainer.destroy();
			sandbox.restore();
		},
		after: function () {

		}
	}, function() {
		QUnit.test("when an element overlay is destroyed", function (assert) {
			var done = assert.async();
			this.oOutline.attachEventOnce("update", function(aUpdates) {
				var oLastUpdate = aUpdates.pop();
				assert.strictEqual(oLastUpdate.type, "destroy", "then a destroy update is sent");
				assert.strictEqual(oLastUpdate.element.id, this.oButton.getId(), "then a destroy update is sent for the correct node");
				done();
			}, this);
			this.oButton.destroy(); //destroys overlay
		});

		QUnit.test("when button1 and button2 are destroyed but the parent aggregation of button1 is already being destroyed", function (assert) {
			var done = assert.async();
			this.oOutline.attachEventOnce("update", function(aUpdates) {
				var oLastUpdate = aUpdates.pop();
				assert.strictEqual(oLastUpdate.type, "destroy", "then only one destroy update is sent");
				assert.strictEqual(oLastUpdate.element.id, this.oButton1.getId(), "and it is sent only for button2");
				done();
			}, this);
			this.oButton.destroy();
			this.oButton1.destroy();
		});

		QUnit.test("when an element is inserted into an already existing aggregation", function (assert) {
			var done = assert.async();
			assert.expect(2);
			var oExpectedResponse1 = {
				type: "new",
				targetIndex: 1,
				targetId: "layout0",
				targetAggregation: "content",
				element: {
					id: "newButton",
					technicalName: "sap.m.Button",
					editable: false,
					icon: "sap/m/designtime/Button.icon.svg",
					type: "element",
					visible: true
				}
			};
			var oExpectedResponse2 = {
				type: "editableChange",
				element: {
					id: "newButton",
					editable: true
				}
			};

			this.oOutline.attachEvent("update", function(aUpdates) {
				aUpdates.some(function(oUpdate) {
					switch (oUpdate.type) {
						case "new":
							assert.deepEqual(oUpdate, oExpectedResponse1, "then expected response for new update was received");
							var oNewButton = this.oLayout.getContent().filter(function(oControl) {
								return oControl.getId() === "newButton";
							})[0];
							var oNewButtonOverlay = OverlayRegistry.getOverlay(oNewButton);
							oNewButtonOverlay.setEditable(true);
							break;
						case "editableChange":
							assert.deepEqual(oUpdate, oExpectedResponse2, "then expected response for editableChange update was received");
							done();
							break;
						default:
							assert.notOk(true, "then ether 'new' or 'editableChange' type expected");
					}
				}.bind(this));
			}, this);
			this.oLayout.addContent(new Button("newButton")); //inserts new overlay
			sap.ui.getCore().applyChanges();
		});

		QUnit.test("when setEditable is called for an existing overlay", function (assert) {
			var done = assert.async();
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			var bOriginalEditable = oButtonOverlay.getEditable();

			var oExpectedResponse = {
				type: "editableChange",
				element: {
					id: "button1",
					editable: !bOriginalEditable
				}
			};

			this.oOutline.attachEventOnce("update", function(aUpdates) {
				assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for editableChange update was received");
				done();
			}, this);
			oButtonOverlay.setEditable(!bOriginalEditable);
		});

		QUnit.test("when move of an aggregation occurs from one overlay to another", function (assert) {
			var done = assert.async();
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
			var oRelevantContainer = oButtonOverlay.getRelevantContainer();
			var oParentAggregationOverlay = oButtonOverlay.getParentAggregationOverlay();
			var oExpectedResponse = {
				type: "move",
				targetIndex: 1,
				targetId: "layout1",
				targetAggregation: "content",
				element: {
					id: "button",
					instanceName: "Button 1",
					technicalName: "sap.m.Button",
					editable: false,
					icon: "sap/m/designtime/Button.icon.svg",
					type: "element",
					visible: true
				}
			};
			var oCommandFactory = new CommandFactory({
				flexSettings: this.oRta.getFlexSettings()
			});

			return oCommandFactory.getCommandFor(oRelevantContainer, "move", {
				movedElements : [{
					element : this.oButton,
					sourceIndex : 0,
					targetIndex : 1
				}],
				source : {
					aggregation: "content",
					parent: this.oLayout
				},
				target : {
					aggregation: "content",
					parent: this.oLayout1
				}
			}, oParentAggregationOverlay.getDesignTimeMetadata())

			.then(function(oMoveCommand) {
				this.oOutline.attachEventOnce("update", function(aUpdates) {
					assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for move update was received");
					done();
				}, this);
				return oMoveCommand.execute();
			}.bind(this))

			.catch(function (oError) {
				assert.ok(false, 'catch must never be called - Error: ' + oError);
			});
		});

		QUnit.test("when a elementPropertyChange is triggered on an element with an existing overlay", function (assert) {
			assert.expect(2);
			var done = assert.async(2);

			var oExpectedResponse = {
				element: {
					editable: false,
					icon: "sap/m/designtime/Button.icon.svg",
					id: "button",
					instanceName: "newText",
					technicalName: "sap.m.Button",
					type: "element",
					visible: true
				},
				name: "text",
				oldValue: "Button 1",
				type: "elementPropertyChange",
				value: "newText"
			};

			this.oOutline.attachEvent("update", function(aUpdates) {
				assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for elementPropertyChange update was received");
				oExpectedResponse = {
					type: "elementPropertyChange",
					name: "type",
					value: "Back",
					oldValue: "Default",
					element: oExpectedResponse.element // unchanged
				};
				//property change operation #2
				this.oButton.setType("Back");
				done();
			}, this);

			//property change operation #1
			this.oButton.setText("newText");
		});

		QUnit.test("when a root element is added to the design time", function (assert) {
			var done = assert.async();
			jQuery.getJSON("test-resources/sap/ui/rta/qunit/service/Outline.json", function (aExpectedOutlineData) {
				aExpectedOutlineData[1].elements[0].elements.splice(1, 1); // clean-up of unwanted element

				// control editable property is initially false
				aExpectedOutlineData[1].editable = false;
				aExpectedOutlineData[1].elements[0].elements[0].editable = false;

				var oExpectedResponse = {
					type: "new",
					element: aExpectedOutlineData[1]
				};
				var oOuterLayout = new VerticalLayout({
					id: "layout2",
					content: [new Button("button2")]
				});
				oOuterLayout.placeAt('qunit-fixture');
				sap.ui.getCore().applyChanges();

				this.oRta._oDesignTime.addRootElement(oOuterLayout);
				this.oOutline.attachEventOnce("update", function (aUpdates) {
					assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for new update was received");
					oOuterLayout.destroy();
					done();
				}, this);
			}.bind(this));
		});
	});

	var sXmlString =
	'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns="sap.m">' +
		'<Panel id="panel">' +
			'<content>' +
				'<core:ExtensionPoint name="ExtensionPoint1" />' +
				'<Label id="label2" text="Panel with stable id" />' +
				'<core:ExtensionPoint name="ExtensionPoint2">' +
					'<Label id="ep2-label1" text="Extension point label1 - default content" />' +
					'<Label id="ep2-label2" text="Extension point label2 - default content" />' +
				'</core:ExtensionPoint>' +
			'</content>' +
		'</Panel>' +
	'</mvc:View>';

	function _createComponent() {
		return sap.ui.getCore().createComponent({
			name: "testComponent",
			id: "testComponent",
			metadata: {
				manifest: "json"
			}
		});
	}

	function _createAsyncView(sViewName, oComponent) {
		return oComponent.runAsOwner(function () {
			return XMLView.create({
				id: sViewName,
				definition: sXmlString,
				async: true
			});
		});
	}

	QUnit.module("Given that xmlView with extensionPoints, RuntimeAuthoring and Outline service are created ", {
		beforeEach: function() {
			sandbox.stub(sap.ui.getCore().getConfiguration(), "getDesignMode").returns(true);
			this.oComponent = _createComponent();
			return _createAsyncView("myView", this.oComponent)
				.then(function (oXmlView) {
					this.oXmlView = oXmlView;
					this.oPanel = oXmlView.getContent()[0];
					oXmlView.placeAt("qunit-fixture");
					sap.ui.getCore().applyChanges();

					return new RuntimeAuthoring({
						showToolbars: false,
						rootControl: this.oXmlView
					});
				}.bind(this))
				.then(function (oRta) {
					this.oRta = oRta;
					this.oRta.start();
					return this.oRta.getService("outline");
				}.bind(this))
				.then(function (oService) {
					this.oOutline = oService;
				}.bind(this));
		},
		afterEach: function() {
			this.oRta.destroy();
			this.oComponent.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when get() is called", function (assert) {
			var mExtensionPointOutlineItem = {
				name: "ExtensionPoint2",
				technicalName: "sap.ui.extensionpoint",
				type: "extensionPoint",
				id: "myView--panel",
				icon: "sap/ui/core/designtime/Icon.icon.svg",
				extensionPointInfo: {
					defaultContent: [
						"myView--ep2-label1",
						"myView--ep2-label2"
					]
				}
			};
			return this.oOutline.get()
				.then(function(aReceivedResponse) {
					var aPanelContent = aReceivedResponse[0].elements[0].elements[0].elements[0].elements;
					assert.strictEqual(aPanelContent[0].technicalName, "sap.ui.extensionpoint", "then in the panel content the first item is an ExtensionPoint");
					assert.strictEqual(aPanelContent[1].technicalName, "sap.m.Label", "then in the panel content the second item is a Label");
					assert.strictEqual(aPanelContent[2].technicalName, "sap.ui.extensionpoint", "then in the panel content the third item is an ExtensionPoint");
					assert.strictEqual(aPanelContent[3].technicalName, "sap.m.Label", "then in the panel content the fourth item is a Label (default content)");
					assert.strictEqual(aPanelContent[4].technicalName, "sap.m.Label", "then in the panel content the fifth item is a Label (default content)");
					assert.deepEqual(aPanelContent[2], mExtensionPointOutlineItem, "then all properties of the extension point outline item are correct");
				});
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});