/* global QUnit*/
QUnit.config.autostart = false;
QUnit.dump.maxDepth = 50;

sap.ui.require([
	"sap/ui/rta/service/Outline",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/command/Move",
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/Page",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/core/UIComponent",
	"sap/base/Log",
	"sap/ui/thirdparty/sinon-4"
],
	function(
	Outline,
	RuntimeAuthoring,
	Move,
	DtUtil,
	OverlayRegistry,
	DesignTime,
	VerticalLayout,
	Button,
	Page,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	CommandFactory,
	UIComponent,
	Log,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

	var oPage;

	var oMockComponent = UIComponent.extend("MockController", {
		metadata: {
			manifest: {
				"sap.app" : {
					applicationVersion : {
						version : "1.2.3"
					}
				}
			}
		},
		createContent : function() {
			oPage = new Page("mainPage");
			return oPage;
		}
	});

	var fnDepthErrorCheck = function(assert, bDepthLevelsCovered) {
		if (!bDepthLevelsCovered) {
			assert.ok(false, "all node depth levels not covered");
		}
	};

	QUnit.module("Given a RuntimeAuthoring instance", {
		beforeEach: function() {
			this.oRta = new RuntimeAuthoring();
		},
		afterEach: function() {
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when Outline service is requested, designtime is not available and designtime fails later", function(assert) {
			var oFactoryService = Outline(this.oRta);
			this.oRta.fireFailed();
			return oFactoryService.then(
				function() {
					assert.ok(false, "promise should never be resolved");
				},
				function(oError) {
					assert.ok(true, "then promise rejected");
					assert.throws(
						function() {
							throw oError;
						},
						DtUtil.createError("services.Outline#get", "Designtime failed to load. This is needed to start the Outline service", "sap.ui.rta"),
						"then the correct error is thrown"
					);
				});
		});
		QUnit.test("when Outline service is requested, designtime is not available and designtime succeeds later", function(assert) {
			this.oRta._oDesignTime = {
				attachEvent : function () {},
				getRootElements : function () {
					return [];
				}
			};
			var oFactoryService = Outline(this.oRta);
			this.oRta.fireStart();
			return oFactoryService
				.then(function(oReturn) {
					delete this.oRta._oDesignTime;
					assert.ok(true, "then promise resolved");
					assert.strictEqual(typeof oReturn.exports.get, "function", "then get function is retrieved");
				}.bind(this));

		});
		QUnit.test("when Outline service is requested, with designtime loaded", function(assert) {
			this.oRta._oDesignTime = new DesignTime();
			var oFactoryService = Outline(this.oRta);
			return oFactoryService.then(
				function(oReturn) {
					assert.ok(true, "then promise resolved");
					assert.strictEqual(typeof oReturn.exports.get, "function", "then get function is retrieved");
				});
		});
	});

	QUnit.module("Given that RuntimeAuthoring and Outline service are created and get function is called", {
		before: function(assert) {
			var done = assert.async();

			this.oComp = new oMockComponent("testComponent");

			// --Root control 1
			//	page
			//		objectPageLayout
			//			objectPageSection (sections)
			//				objectPageSubSection
			//					verticalLayout
			//						button

			this.oButton1 = new Button("button1");

			this.oLayout = new VerticalLayout("layout1",{
				content : [this.oButton1]
			});

			this.oObjectPageSubSection = new ObjectPageSubSection("objSubSection", {
				blocks: [this.oLayout]
			});

			this.oObjectPageSection = new ObjectPageSection("objSection",{
				subSections: [this.oObjectPageSubSection]
			});

			this.oObjectPageLayout = new ObjectPageLayout("objPage",{
				sections : [this.oObjectPageSection]
			});

			oPage.addContent(this.oObjectPageLayout);

			// --Root control 2
			//	verticalLayout
			//		button

			this.oButton2 = new Button("button2");

			this.oOuterLayout = new VerticalLayout("layout2",{
				content : [this.oButton2]
			});

			this.oRta = new RuntimeAuthoring({
				showToolbars: false,
				rootControl: oPage
			});

			// check designtime metadata label property
			sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor").withArgs(this.oLayout)
				.returns({
					getLabel: function(oLayout) {
						if (oLayout === this.oLayout) {
							return "Vertical Layout Label";
						}
					}.bind(this)
				});

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
				var oPageOverlay = OverlayRegistry.getOverlay(oPage);
				oPageOverlay.setEditable(true);
				this.oRta._oDesignTime.addRootElement(this.oOuterLayout);
			}.bind(this));

			this.oRta.start();
		},
		after: function() {
			this.oRta.destroy();
			this.oObjectPageLayout.destroy();
			this.oOuterLayout.destroy();
			this.oComp.destroy();
			oPage.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when get() is called and and no parameter is passed for initial control id and depth", function (assert) {
			var done = assert.async();
			jQuery.getJSON("./testResources/FakeOutline.json", function(aExpectedOutlineData){

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

					if (oChild1.technicalName === "content") { // page content
						assert.ok(Array.isArray(oChild1.elements), "then second level children are returned");

						var oChild2 = oChild1.elements[0]; // object page
						assert.ok(Array.isArray(oChild2.elements), "then third level children are returned");

						return oChild2.elements.some(function (oChild3){
							if (oChild3.technicalName === "sections"){ // object page sections
								assert.notOk(oChild3.elements, "then fourth level children are not returned");
								return true;
							}
						});
					}
				});

				fnDepthErrorCheck(assert, bDepthLevelsCovered);
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

				fnDepthErrorCheck(assert, bDepthLevelsCovered);
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

				fnDepthErrorCheck(assert, bDepthLevelsCovered);
			});
		});
	});

	QUnit.module("Given that RuntimeAuthoring and Outline service are created and get function is called", {
		beforeEach: function(assert) {
			var done = assert.async();

			this.oComp = new oMockComponent("testComponent");

			// --Root control
			//	page
			//		verticalLayout
			//			button

			this.oButton = new Button("button", {text: "Button 1"});
			this.oButton1 = new Button("button1", {text: "Button 2"});

			this.oLayout = new VerticalLayout("layout0",{
				content : [this.oButton]
			});

			this.oLayout1 = new VerticalLayout("layout1",{
				content : [this.oButton1]
			});

			oPage.addContent(this.oLayout);
			oPage.addContent(this.oLayout1);

			this.oRta = new RuntimeAuthoring({
				rootControl: oPage,
				showToolbars: false
			});

			this.oRta.getService("outline").then(function (oService) {
				this.oOutline = oService;
				done();
			}.bind(this));

			this.oRta.start();
		},
		afterEach: function() {
			this.oRta.destroy();
			oPage.removeContent();
			this.oComp.destroy();
			sandbox.restore();
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
			var oAggregationOverlay = OverlayRegistry.getOverlay(this.oButton).getParentAggregationOverlay();
			this.oOutline.attachEventOnce("update", function(aUpdates) {
				var oLastUpdate = aUpdates.pop();
				assert.strictEqual(oLastUpdate.type, "destroy", "then only one destroy update is sent");
				assert.strictEqual(oLastUpdate.element.id, this.oButton1.getId(), "and it is sent only for button2");
				done();
			}, this);
			oAggregationOverlay._bIsBeingDestroyed = true;
			this.oButton.destroy();
			this.oButton1.destroy();
		});

		QUnit.test("when an element is inserted into an already existing aggregation", function (assert) {
			var done = assert.async();
			assert.expect(3);
			var oExpectedResponse1 = {
				"type": "new",
				"targetIndex": 1,
				"targetId": "layout0",
				"targetAggregation": "content",
				"element": {
					"id": "newButton",
					"technicalName": "sap.m.Button",
					"editable": false,
					"icon": "sap/m/designtime/Button.icon.svg",
					"type": "element"
				}
			};
			var oExpectedResponse2 = {
				"type": "editableChange",
				"element": {
					"id": "newButton",
					"editable": false
				}
			};

			this.oOutline.attachEventOnce("update", function(aUpdates) {
				aUpdates.some(function(oUpdate) {
					switch (oUpdate.type) {
						case "new":
							assert.deepEqual(oUpdate, oExpectedResponse1, "then expected reponse for new update was received");
							break;
						case "editableChange":
							assert.deepEqual(oUpdate, oExpectedResponse2, "then expected response for editableChange update was received");
							// two "editableChanges" updates expected, first for false, second for true
							if (!oExpectedResponse2.element.editable) {
								oExpectedResponse2.element.editable = true;
							} else {
								done();
								return true;
							}
					}
				});

			}, this);
			this.oLayout.addContent(new Button("newButton")); //inserts new overlay
		});

		QUnit.test("when setEditable is called for an existing overlay", function (assert) {
			var done = assert.async();
			var oButtonOverlay = OverlayRegistry.getOverlay(this.oButton1);
			var bOriginalEditable = oButtonOverlay.getEditable();

			var oExpectedResponse = {
				"type": "editableChange",
				"element": {
					"id": "button1",
					"editable": !bOriginalEditable
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
				"type": "move",
				"targetIndex": 1,
				"targetId": "layout1",
				"targetAggregation": "content",
				"element": {
					"id": "button",
					"instanceName": "Button 1",
					"technicalName": "sap.m.Button",
					"editable": true,
					"icon": "sap/m/designtime/Button.icon.svg",
					"type": "element"
				}
			};
			var oCommand = this.oRta.getDefaultPlugins()["cutPaste"].getCommandFactory().getCommandFor(oRelevantContainer, "move", {
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
			}, oParentAggregationOverlay.getDesignTimeMetadata());

			this.oOutline.attachEventOnce("update", function(aUpdates) {
				assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for move update was received");
				done();
			}, this);

			oCommand.execute();
		});

		QUnit.test("when a elementPropertyChange is triggered on an element with an existing overlay", function (assert) {
			assert.expect(2);
			var done = assert.async(2);

			var oExpectedResponse = {
				"element": {
					"editable": true,
					"icon": "sap/m/designtime/Button.icon.svg",
					"id": "button",
					"instanceName": "newText",
					"technicalName": "sap.m.Button",
					"type": "element"
				},
				"name": "text",
				"oldValue": "Button 1",
				"type": "elementPropertyChange",
				"value": "newText"
			};

			this.oOutline.attachEvent("update", function(aUpdates) {
				assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for elementPropertyChange update was received");
				oExpectedResponse = {
					"type": "elementPropertyChange",
					"name": "type",
					"value": "Back",
					"oldValue": "Default",
					"element": {
						"id": "button",
						"instanceName": "newText",
						"technicalName": "sap.m.Button",
						"editable": true,
						"icon": "sap/m/designtime/Button.icon.svg",
						"type": "element"
					}
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
			jQuery.getJSON("./testResources/FakeOutline.json", function (aExpectedOutlineData) {
				var oButton = new Button("button2");

				// control editable property is initially false
				aExpectedOutlineData[1].editable = false;
				aExpectedOutlineData[1].elements[0].elements[0].editable = false;

				var oExpectedResponse = {
					type: "new",
					element: aExpectedOutlineData[1]
				};
				var oOuterLayout = new VerticalLayout("layout2", {
					content: [oButton]
				});

				this.oRta._oDesignTime.addRootElement(oOuterLayout);
				this.oOutline.attachEventOnce("update", function (aUpdates) {
					assert.deepEqual(aUpdates[0], oExpectedResponse, "then expected response for new update was received");
					oOuterLayout.destroy();
					done();
				}, this);
			}.bind(this));
		});
	});

	QUnit.start();
});