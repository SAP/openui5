/* global QUnit*/
QUnit.config.autostart = false;
QUnit.dump.maxDepth = 50;

sap.ui.require([
	"sap/ui/rta/service/Outline",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/dt/Util",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/DesignTime",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Button",
	"sap/m/Page",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageSection",
	"sap/uxap/ObjectPageSubSection",
	"sap/ui/core/UIComponent",
	"sap/ui/thirdparty/sinon-4"
],
function(
	Outline,
	RuntimeAuthoring,
	DtUtil,
	OverlayRegistry,
	DesignTime,
	VerticalLayout,
	Button,
	Page,
	ObjectPageLayout,
	ObjectPageSection,
	ObjectPageSubSection,
	UIComponent,
	sinon
) {
	"use strict";

	var sandbox = sinon.sandbox.create();

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
					assert.throws(function() {
						throw oError;
					},
					DtUtil.createError("services.Outline#get", "Designtime failed to load. This is needed to start the Outline service", "sap.ui.rta"),
					"then the correct error is thrown");
				});
		});
		QUnit.test("when Outline service is requested, designtime is not available and designtime succeeds later", function(assert) {
			var oFactoryService = Outline(this.oRta);
			this.oRta.fireStart();
			return oFactoryService.then(
				function(oReturn) {
					assert.ok(true, "then promise resolved");
					assert.strictEqual(typeof oReturn.exports.get, "function", "then get function is retrieved");
				});
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

			var oPage = new Page("mainPage");

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
					return oPage;
				}
			});
			this.oComp = new oMockComponent("testComponent");

			// --Root control 1
			//	page
			//		verticalLayout
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
				rootControl: oPage
			});

			// check designtime metadata label property
			sandbox.stub(DesignTime.prototype, "getDesignTimeMetadataFor").withArgs(this.oLayout)
				.returns({
					label: function(oLayout) {
						if (oLayout === this.oLayout) {
							return "Vertical Layout Label";
						}
					}.bind(this)
				});

			this.oRta.getService("outline").then(function (oService) {
				this.oOutline = oService;
			}.bind(this));

			// FIXME: remove attachStart subscription after services are called after RTA is started
			this.oRta.attachStart(function() {
				this.oRta._oDesignTime.addRootElement(this.oOuterLayout);
				var oPageOverlay = OverlayRegistry.getOverlay(oPage);
				oPageOverlay.setEditable(true);
				done();
			}, this);

			this.oRta.start();
		},
		after: function() {
			this.oRta.destroy();
			this.oObjectPageLayout.destroy();
			this.oOuterLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when no parameter is passed for initial control id and depth", function (assert) {
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

		QUnit.test("when depth (3) is passed without initial control id", function (assert) {
			var aRootElements = this.oRta._oDesignTime.getRootElements();
			return this.oOutline.get(3).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, aRootElements[0].getId(), "then outline for first item created starting from the first root element");

				assert.ok(Array.isArray(aReceivedResponse[0].children), "then first level children are returned");
				var bDepthLevelsCovered = aReceivedResponse[0].children.some(function(oChild1) {

					if (oChild1.displayName === "content") { // page content
						assert.ok(Array.isArray(oChild1.children), "then second level children are returned");

						var oChild2 = oChild1.children[0]; // object page
						assert.ok(Array.isArray(oChild2.children), "then third level children are returned");

						return oChild2.children.some(function (oChild3){
							if (oChild3.displayName === "sections"){ // object page sections
								assert.notOk(oChild3.children, "then fourth level children are not returned");
								return true;
							}
						});
					}
				});

				fnDepthErrorCheck(assert, bDepthLevelsCovered);
			});
		});

		QUnit.test("when initial control id is passed without depth", function (assert) {
			return this.oOutline.get("layout2").then(function(aReceivedResponse) {
				assert.ok(aReceivedResponse[0], "then only one item applicable to the passed parameter returned");
				assert.strictEqual(aReceivedResponse[0].id, "layout2", "then outline for first root element tree starts from the passed overlay");
			});
		});

		QUnit.test("when both initial control id and depth (2) are passed", function (assert) {
			return this.oOutline.get("objPage", 2).then(function(aReceivedResponse) {
				assert.strictEqual(aReceivedResponse[0].id, "objPage", "then outline for first item created starting from the passed overlay");

				assert.ok(Array.isArray(aReceivedResponse[0].children), "then first level children are returned");
				var bDepthLevelsCovered = aReceivedResponse[0].children.some(function(oChild1) {
					if (oChild1.displayName === "sections") { // object page sections
						assert.ok(Array.isArray(oChild1.children), "then second level children are returned");

						var oChild2 = oChild1.children[0]; // object page sub section
						assert.notOk(oChild2.children, "then third level children are not returned");
						return true;
					}
				});

				fnDepthErrorCheck(assert, bDepthLevelsCovered);
			});
		});
	});

	QUnit.start();
});