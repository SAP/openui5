/* global QUnit*/

QUnit.dump.maxDepth = 50;

sap.ui.define([
	"sap/m/Button",
	"sap/m/Page",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/Core",
	"sap/ui/core/UIComponent",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/write/_internal/extensionPoint/Registry",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/json/JSONModel",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/plugin/Plugin",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"testdata/StaticDesigntimeMetadata",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
], function(
	Button,
	Page,
	Controller,
	XMLView,
	ComponentContainer,
	oCore,
	UIComponent,
	DesignTime,
	OverlayRegistry,
	Loader,
	ExtensionPointRegistry,
	PersistenceWriteAPI,
	VerticalLayout,
	JSONModel,
	CommandFactory,
	Plugin,
	ReloadManager,
	RuntimeAuthoring,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	StaticDesigntimeMetadata,
	jQuery,
	sinon
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("Given that RuntimeAuthoring and Outline service are created and get function is called", {
		before: function(assert) {
			QUnit.config.fixture = null;
			var done = assert.async();
			var MockComponent = UIComponent.extend("MockController", {
				metadata: {
					manifest: {
						"sap.app": {
							applicationVersion: {
								version: "1.2.3"
							},
							id: "MockController"
						}
					}
				},
				createContent: function() {
					return new Page("mainPage");
				}
			});

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
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
			oCore.applyChanges();

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: this.oComp
			});
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);

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
			function checkElementsFromResponse (aReceivedResponse) {
				return aReceivedResponse[0].elements.some(function(oChild1) {
					if (oChild1.technicalName === "rootControl") { // root control in the component
						assert.ok(Array.isArray(oChild1.elements), "then second level children are returned");

						var oChild2 = oChild1.elements[0]; // content of the page
						assert.ok(Array.isArray(oChild2.elements), "then third level children are returned");

						return oChild2.elements.some(function (oChild3) {
							if (oChild3.technicalName === "content") { // content aggregation of the Page
								assert.notOk(oChild3.elements, "then fourth level children are not returned");
								return true;
							}
						});
					}
				});
			}
			var aRootElements = this.oRta._oDesignTime.getRootElements();
			return this.oOutline.get(3).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, aRootElements[0].getId(), "then outline for first item created starting from the first root element");

				assert.ok(Array.isArray(aReceivedResponse[0].elements), "then first level children are returned");
				var bDepthLevelsCovered = checkElementsFromResponse(aReceivedResponse);
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
							applicationVersion: {
								version: "1.2.3"
							},
							id: "MockController"
						}
					}
				},
				createContent: function() {
					return new Page("mainPage");
				}
			});

			sandbox.stub(PersistenceWriteAPI, "getResetAndPublishInfoFromSession").returns({
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
				content: [this.oButton]
			});

			this.oLayout1 = new VerticalLayout({
				id: "layout1",
				content: [this.oButton1]
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
			oCore.applyChanges();

			this.oRta = new RuntimeAuthoring({
				rootControl: this.oComp,
				showToolbars: false
			});
			this.oRta.setPlugins({ testPlugin: oPlugin });
			sandbox.stub(ReloadManager, "handleReloadOnStart").resolves(false);

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
			function onUpdate(aUpdates) {
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
			}
			this.oOutline.attachEvent("update", onUpdate, this);
			this.oLayout.addContent(new Button("newButton")); //inserts new overlay
			oCore.applyChanges();
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
				movedElements: [{
					element: this.oButton,
					sourceIndex: 0,
					targetIndex: 1
				}],
				source: {
					aggregation: "content",
					parent: this.oLayout
				},
				target: {
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
				oCore.applyChanges();

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
		var MockComponent = UIComponent.extend("MockController", {
			metadata: {
				manifest: {
					"sap.app": {
						id: "myApp",
						applicationVersion: {
							version: "1.2.3"
						}
					},
					"sap.ui5": {
						flexExtensionPointEnabled: true
					}
				}
			}
		});
		return new MockComponent("testComponent");
	}

	function _createAsyncView(sViewName, sXmlView, oComponent, oController) {
		var mController = oController ? { controller: oController } : {};
		return oComponent.runAsOwner(function () {
			return XMLView.create(Object.assign({
				id: sViewName,
				definition: sXmlView,
				async: true
			}, mController));
		});
	}

	function _beforeEachExtensionPoint (sXmlView, oController) {
		sandbox.stub(oCore.getConfiguration(), "getDesignMode").returns(true);
		sandbox.stub(Loader, "loadFlexData").resolves({ changes: [] });
		this.oComponent = _createComponent();
		return _createAsyncView("myView", sXmlView, this.oComponent, oController)
			.then(function (oXmlView) {
				this.oXmlView = oXmlView;
				oXmlView.placeAt("qunit-fixture");
				oCore.applyChanges();
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
	}

	function _afterEachExtensionPoint () {
		this.oRta.destroy();
		this.oComponent.destroy();
		this.oXmlView.destroy();
		ExtensionPointRegistry.clear();
		sandbox.restore();
	}

	QUnit.module("Given that xmlView with extensionPoints, RuntimeAuthoring and Outline service are created ", {
		beforeEach: function () {
			return _beforeEachExtensionPoint.call(this, sXmlString);
		},
		afterEach: function () {
			return _afterEachExtensionPoint.call(this);
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

	var oXmlSimpleForm =
		'<mvc:View id="testComponent---myView" xmlns:mvc="sap.ui.core.mvc"  xmlns:core="sap.ui.core" xmlns:form="sap.ui.layout.form" xmlns="sap.m">' +
			'<form:SimpleForm editable="true" layout="ResponsiveGridLayout" labelSpanL="1" labelSpanM="3" columnsL="1" ' +
				'columnsM="1" emptySpanL="1" emptySpanM="0" width="100%" title="test_simpleform" maxContainerCols="1">' +
				'<form:content>' +
					'<core:ExtensionPoint name="ExtensionPoint3">' +
						'<Label id="ep3-label3" text="Extension point label3 - default content" />' +
					'</core:ExtensionPoint>' +
					'<Label id="label3" text="label3"></Label>' +
				'</form:content>' +
			'</form:SimpleForm>' +
		'</mvc:View>';

	QUnit.module("Given that xmlView with extensionPoints, RuntimeAuthoring and Outline service are created with 'simple form'", {
		beforeEach: function () {
			return _beforeEachExtensionPoint.call(this, oXmlSimpleForm);
		},
		afterEach: function () {
			return _afterEachExtensionPoint.call(this);
		}
	}, function() {
		QUnit.test("when get() is called", function (assert) {
			var mExtensionPointOutlineItem = {
				name: "ExtensionPoint3",
				technicalName: "sap.ui.extensionpoint",
				type: "extensionPoint",
				id: "myView",
				icon: "sap/ui/core/designtime/Icon.icon.svg",
				extensionPointInfo: {
					defaultContent: [
						"myView--ep3-label3"
					]
				}
			};
			return this.oOutline.get()
				.then(function(aReceivedResponse) {
					var aRootElements = aReceivedResponse[0].elements;
					assert.strictEqual(aRootElements[0].technicalName, "sap.ui.extensionpoint", "then in the view elements the first item is an ExtensionPoint");
					assert.strictEqual(aRootElements[1].technicalName, "content", "then in the view elements the second item is an content aggregation");
					assert.deepEqual(aRootElements[0], mExtensionPointOutlineItem, "then all properties of the extension point outline item are correct");
					var oFormAggregation = aRootElements[1].elements[0].elements[0];
					var oFormContainerAggregation = oFormAggregation.elements[0].elements[0];
					var oFormElementsAggregation = oFormContainerAggregation.elements[0].elements[0];
					assert.deepEqual(oFormElementsAggregation.elements[0].instanceName, "Extension point label3 - default content",
						"then the lable from default content of the extension point is now placed in the FormElements aggregation");
					assert.deepEqual(oFormElementsAggregation.elements[1].instanceName, "label3",
						"then the lable outsite the extension point is now placed in the FormElements aggregation");
				});
		});
	});

	function createController(sController, oData) {
		var MyController = Controller.extend(sController, {
			onInit: function () {
				var oModel = new JSONModel(oData);
				this.getView().setModel(oModel);
			}
		});
		return new MyController();
	}

	QUnit.module("Given that xmlView with table and extensionPoint (RuntimeAuthoring and outline service are started) - Template case", {
		afterEach: function () {
			return _afterEachExtensionPoint.call(this);
		}
	}, function() {
		QUnit.test("for four products in the collection, when get() is called", function (assert) {
			var oXmlTable =
			'<mvc:View id="testComponent---myView" controllerName="myController" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<List id="ShortProductList" headerText="Products" items="{path: \'/ProductCollection\'}">' +
					'<items>' +
						'<StandardListItem title="{Name}" />' +
					'</items>' +
				'</List>' +
			'</mvc:View>';

			var oData = {
				ProductCollection: [
					{ ProductId: "HT-1000", Category: "Laptops" },
					{ ProductId: "HT-1001", Category: "Laptops" },
					{ ProductId: "HT-1007", Category: "Accessories" },
					{ ProductId: "HT-1010", Category: "Memory" }
				]
			};
			var oController = createController("myController", oData);
			return _beforeEachExtensionPoint.call(this, oXmlTable, oController)
				.then(function() {
					return this.oOutline.get();
				}.bind(this))
				.then(function(aReceivedResponse) {
					var aRootElements = aReceivedResponse[0].elements;
					assert.strictEqual(aRootElements[0].technicalName, "content",
						"then in the view elements the second item is a content aggregation");
					var oListElementInfo = aRootElements[0].elements[0];
					assert.strictEqual(oListElementInfo.technicalName, "sap.m.List",
						"then sap.m.List is available in the view elements");
					assert.strictEqual(oListElementInfo.elements.length, 4,
						"then list contains 4 entries: the template element + 2 empty aggregations + the items aggregation");
					assert.strictEqual(oListElementInfo.elements[0].icon, "sap-icon://attachment-text-file",
						"then the first list entry (aggregation binding template) has the correct icon assigned");
					assert.strictEqual(oListElementInfo.elements[0].name, "List Item",
						"then the first list entry is named according to the template control type");
					assert.strictEqual(oListElementInfo.elements[0].type, "aggregationBindingTemplate",
						"then the first list entry contains the template with the type 'aggregationBindingTemplate'");
					assert.strictEqual(oListElementInfo.elements[2].icon, "sap-icon://card",
						"then the second list entry (empty aggregation) has the correct icon assigned");
					assert.strictEqual(oListElementInfo.elements[2].type, "aggregation",
						"then the second list entry (empty aggregation) has the correct type (aggregation)");
					assert.strictEqual(
						oListElementInfo.elements[1].elements.length,
						4,
						"then the items aggregation contains the instances from the binding"
					);
					var sExpectedTemplateReference = oListElementInfo.elements[0].id;
					assert.notOk(
						oListElementInfo.hasOwnProperty("templateReference"),
						"then elements outside the aggregation binding have no template reference"
					);
					assert.strictEqual(
						oListElementInfo.elements[1].templateReference,
						sExpectedTemplateReference,
						"then the aggregation overlay has a reference on the template item"
					);
					assert.ok(
						oListElementInfo.elements[1].elements.every(function(oItem) {
							return oItem.templateReference === sExpectedTemplateReference;
						}),
						"then each aggregation instance has a reference on the template item"
					);
				});
		});

		QUnit.test("when an aggregation contains a template with a nested aggregation", function (assert) {
			var oXmlTable =
			'<mvc:View id="testComponent---myView" controllerName="myController" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<VBox id="ShortProductList" headerText="Products" items="{path: \'/ProductCollection\'}">' +
					'<items>' +
						'<VBox id="vb2">' +
							'<items>' +
								'<Button id="myButton" text="Hello" />' +
							'</items>' +
						'</VBox>' +
					'</items>' +
				'</VBox>' +
			'</mvc:View>';

			var oData = {
				ProductCollection: [
					{ ProductId: "HT-1000", Category: "Laptops" },
					{ ProductId: "HT-1001", Category: "Laptops" },
					{ ProductId: "HT-1007", Category: "Accessories" },
					{ ProductId: "HT-1010", Category: "Memory" }
				]
			};
			var oController = createController("myController", oData);
			return _beforeEachExtensionPoint.call(this, oXmlTable, oController)
				.then(function() {
					return this.oOutline.get();
				}.bind(this))
				.then(function(aReceivedResponse) {
					var oOuterVBox = aReceivedResponse[0].elements[0].elements[0];
					var oTemplate = oOuterVBox.elements[0];
					var oInstance = oOuterVBox.elements[1].elements[0];

					assert.strictEqual(
						oInstance.templateReference,
						oTemplate.id,
						"then instances have a reference on the template"
					);
					assert.strictEqual(
						oInstance.elements[0].elements[0].templateReference,
						oTemplate.elements[0].elements[0].id,
						"then nested elements reference the equivalent elements in the template structure"
					);
					assert.notOk(
						oTemplate.elements[0].elements[0].hasOwnProperty("templateReference"),
						"then elements in the template structure have no template reference"
					);
				});
		});

		QUnit.test("when an aggregation contains a template with a nested template", function (assert) {
			var oXmlTable =
			'<mvc:View id="testComponent---myView" controllerName="myController" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<VBox id="ShortProductList" headerText="Products" items="{path: \'/ProductCollection\', templateShareable: false}">' +
					'<items>' +
						'<VBox id="vb2NoTemplate">' +
							'<Button id="vb2TopButton" text="Prepended element" />' +
							'<VBox id="vb3WithTemplate" items="{path: \'/ProductCollection\', templateShareable: false}">' +
								'<items>' +
									'<Button id="vb3Button" text="{ProductId}" />' +
								'</items>' +
							'</VBox>' +
							'<Button id="vb2BottomButton" text="Appended element" />' +
						'</VBox>' +
					'</items>' +
				'</VBox>' +
			'</mvc:View>';

			var oData = {
				ProductCollection: [
					{ ProductId: "HT-1000", Category: "Laptops" },
					{ ProductId: "HT-1001", Category: "Laptops" },
					{ ProductId: "HT-1007", Category: "Accessories" },
					{ ProductId: "HT-1010", Category: "Memory" }
				]
			};
			var oController = createController("myController", oData);
			return _beforeEachExtensionPoint.call(this, oXmlTable, oController)
				.then(function() {
					return this.oOutline.get();
				}.bind(this))
				.then(function(aReceivedResponse) {
					var oOuterVBox = aReceivedResponse[0].elements[0].elements[0];
					var oOuterTemplate = oOuterVBox.elements[0];
					var oInnerTemplate = oOuterTemplate.elements[0].elements[1];
					var oOuterInstance = oOuterVBox.elements[1].elements[0];
					var oInnerInstance = oOuterInstance.elements[0].elements[1];

					assert.strictEqual(
						oOuterInstance.templateReference,
						oOuterTemplate.id,
						"then the root template is properly referenced"
					);
					assert.strictEqual(
						oOuterInstance.elements[0].elements[0].templateReference,
						oOuterTemplate.elements[0].elements[0].id,
						"then nested elements reference the equivalent elements in the outer template structure - top button"
					);
					assert.strictEqual(
						oOuterInstance.elements[0].elements[2].templateReference,
						oOuterTemplate.elements[0].elements[2].id,
						"then nested elements reference the equivalent elements in the outer template structure - bottom button"
					);
					assert.strictEqual(
						oInnerInstance.templateReference,
						oInnerTemplate.id,
						"then the nested template is properly referenced"
					);
					assert.strictEqual(
						oInnerInstance.elements[0].templateReference,
						oInnerTemplate.elements[0].id,
						"then nested elements reference the equivalent elements in the inner template structure"
					);
				});
		});

		QUnit.test("for empty product collection, when get() is called", function (assert) {
			var oXmlTable =
			'<mvc:View id="testComponent---myView" controllerName="myController" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<List id="ShortProductList" headerText="Products" items="{path: \'/ProductCollection\'}">' +
					'<items>' +
						'<StandardListItem title="{Name}" />' +
					'</items>' +
				'</List>' +
			'</mvc:View>';

			var oData = {
				ProductCollection: []
			};
			var oController = createController("myController", oData);
			return _beforeEachExtensionPoint.call(this, oXmlTable, oController)
				.then(function() {
					return this.oOutline.get();
				}.bind(this))
				.then(function(aReceivedResponse) {
					var aRootElements = aReceivedResponse[0].elements;
					assert.strictEqual(aRootElements[0].technicalName, "content",
						"then in the view elements the second item is a content aggregation");
					var oListElementInfo = aRootElements[0].elements[0];
					assert.strictEqual(oListElementInfo.technicalName, "sap.m.List",
						"then sap.m.List is available in the view elements");
					assert.strictEqual(oListElementInfo.elements.length, 4,
						"then list contains 4 entries: the template element + 2 empty aggregations from the control + items aggregation");
					assert.strictEqual(oListElementInfo.elements[0].icon, "sap-icon://attachment-text-file",
						"then the first list entry (aggregation binding template) has the correct icon assigned");
					assert.strictEqual(oListElementInfo.elements[0].name, "List Item",
						"then the first list entry contains the template");
					assert.strictEqual(oListElementInfo.elements[0].type, "aggregationBindingTemplate",
						"then the first list entry contains the template with the type 'aggregationBindingTemplate'");
				});
		});

		QUnit.test("for two lists, when get() is called", function (assert) {
			var oXmlTable =
			'<mvc:View id="testComponent---myView" controllerName="myController" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns="sap.m">' +
				'<List id="ShortProductList" headerText="Products" items="{path: \'/ProductCollection\'}">' +
					'<items>' +
						'<StandardListItem title="{Name}" />' +
					'</items>' +
				'</List>' +
				'<List id="ShortPotatoList" headerText="Potatoes" items="{path: \'/PotatoCollection\'}">' +
					'<items>' +
						'<StandardListItem title="{Name}" />' +
					'</items>' +
				'</List>' +
			'</mvc:View>';

			var oData = {
				ProductCollection: [
					{ ProductId: "HT-1000", Category: "Laptops" },
					{ ProductId: "HT-1001", Category: "Laptops" }
				],
				PotatoCollection: [
					{ PotatoId: "French Fries", Category: "Fried" }
				]
			};
			var oController = createController("myController", oData);
			return _beforeEachExtensionPoint.call(this, oXmlTable, oController)
				.then(function() {
					return this.oOutline.get();
				}.bind(this))
				.then(function(aReceivedResponse) {
					var aRootElements = aReceivedResponse[0].elements;
					assert.strictEqual(aRootElements[0].technicalName, "content",
						"then in the view elements the second item is a content aggregation");
					var oList1ElementInfo = aRootElements[0].elements[0];
					assert.strictEqual(oList1ElementInfo.technicalName, "sap.m.List",
						"then sap.m.List is available in the view elements");
					assert.strictEqual(oList1ElementInfo.elements.length, 4,
						"then first list contains 4 entries: the template element + 2 empty aggregations from the control + items aggregation");
					assert.strictEqual(oList1ElementInfo.elements[0].icon, "sap-icon://attachment-text-file",
						"then the first list entry (aggregation binding template) has the correct icon assigned");
					assert.strictEqual(oList1ElementInfo.elements[0].name, "List Item",
						"then the first list entry contains the template");
					assert.strictEqual(oList1ElementInfo.elements[0].type, "aggregationBindingTemplate",
						"then the first list entry contains the template with the type 'aggregationBindingTemplate'");

					var oList2ElementInfo = aRootElements[0].elements[1];
					assert.strictEqual(oList2ElementInfo.elements.length, 4,
						"then second list contains 4 entries: the template element + 2 empty aggregations from the control + items aggregation");
					assert.strictEqual(oList2ElementInfo.elements[0].icon, "sap-icon://attachment-text-file",
						"then the first list entry (aggregation binding template) has the correct icon assigned");
					assert.strictEqual(oList2ElementInfo.elements[0].name, "List Item",
						"then the frist list entry contains the template");
					assert.strictEqual(oList2ElementInfo.elements[0].type, "aggregationBindingTemplate",
						"then the first list entry contains the template with the type 'aggregationBindingTemplate'");
				});
		});
	});

	QUnit.done(function () {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});