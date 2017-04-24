sap.ui.define([
	// external:
	'jquery.sap.global',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'sap/m/Page',
	// internal:
	'sap/ui/dt/Overlay',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/ElementUtil',
	// should be last:
	'sap/ui/qunit/qunit-coverage',
	'sap/ui/thirdparty/sinon',
	'sap/ui/thirdparty/sinon-ie',
	'sap/ui/thirdparty/sinon-qunit'
],
function(
	jQuery,
	Button,
	VerticalLayout,
	Page,
	Overlay,
	OverlayRegistry,
	DesignTime,
	ElementUtil
) {
	"use strict";

	QUnit.start();

	var isOverlayForElementInDesignTime = function (oElement, oDesignTime) {
		var bResult = false;

		var aOverlays = oDesignTime.getElementOverlays();
		var aFoundOverlay = jQuery.each(aOverlays, function(iIndex, oOverlay) {
			if (oOverlay.getElementInstance() === oElement) {
				bResult = true;
				return false;
			}
		});

		return bResult;
	};

	QUnit.module("Given that the DesignTime is created for a root control", {
		beforeEach : function(assert) {
			this.oDesignTime = new DesignTime();
		},
		afterEach : function(assert) {
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the DesignTime is created for a root control ", function(assert) {
		var that = this;

		var done = assert.async();

		this.oButton = new Button();

		var bSyncingCalled = false;
		this.oDesignTime.attachEventOnce("syncing", function() {
			bSyncingCalled = true;
		});

		this.oDesignTime.addRootElement(this.oButton);

		this.oDesignTime.attachEventOnce("synced", function() {
			assert.ok(bSyncingCalled, "then syncing event was called initially");
			assert.ok("and synced event was called");

			assert.strictEqual(isOverlayForElementInDesignTime(that.oButton, that.oDesignTime), true, "overlay for button exists");
			var oButtonDTMetadata = OverlayRegistry.getOverlay(that.oButton).getDesignTimeMetadata();
			assert.equal(oButtonDTMetadata.getLibraryName(), "sap.m", "the DesignTimeMetadata containing the libraryName");

			done();
		});
	});

	QUnit.module("Given that the DesignTime is created for a root control", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton1 = new Button("button1");
			this.oButton2 = new Button("button2");
			this.oInnerLayout = new VerticalLayout({
				content : [
					this.oButton1,
					this.oButton2
				]
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oInnerLayout]
			});

			this.oOuterLayout.placeAt("content");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oOuterLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				done();
			});
		},
		afterEach : function(assert) {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the DesignTime is initialized ", function(assert) {
		var aOverlays = this.oDesignTime.getElementOverlays();

		assert.strictEqual(aOverlays.length, 4, "Overlays for 4 elements created");

		assert.ok(isOverlayForElementInDesignTime(this.oOuterLayout, this.oDesignTime), "overlay for layout exists");
		assert.ok(isOverlayForElementInDesignTime(this.oInnerLayout, this.oDesignTime), "overlay for inner layout exists");
		assert.ok(isOverlayForElementInDesignTime(this.oButton1, this.oDesignTime), "overlay for button1 exists");
		assert.ok(isOverlayForElementInDesignTime(this.oButton2, this.oDesignTime), "overlay for button2 exists");

		assert.strictEqual(this.oDesignTime.getSelection().length, 0, "and selection is empty");
	});

	QUnit.test("... and new control without overlay is added to a root control aggregation", function(assert) {
		var done = assert.async();

		var oButton = new Button();
		var oLayout = new VerticalLayout({content : [oButton]});

		var aOverlay = [];

		var bSyncingCalled = false;
		this.oDesignTime.attachEventOnce("syncing", function() {
			bSyncingCalled = true;
		});

		var iElementOverlaysCreated = 0;
		this.oDesignTime.attachEvent("elementOverlayCreated", function() {
			iElementOverlaysCreated++;
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			assert.strictEqual(bSyncingCalled, true, "syncing event was called");
			assert.strictEqual(iElementOverlaysCreated, 2, "two element overlays created events were called");

			assert.ok(OverlayRegistry.getOverlay(oButton), "overlay for the button exists");
			assert.ok(OverlayRegistry.getOverlay(oLayout), "overlay for the layout exists");

			done();
		});

		this.oOuterLayout.addContent(oLayout);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("when new control without overlay is added to a root control and a promise reject happens in loadDesignTimeMetadata promise", function(assert) {
		var done = assert.async();

		var oButton = new Button();

		this.stub(ElementUtil, "loadDesignTimeMetadata").returns(Promise.reject("Error"));

		this.oDesignTime.attachEventOnce("synced", function() {
			assert.ok(true, "then synced is called also in an pormise reject case");
			done();
		});

		this.oOuterLayout.addContent(oButton);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("when control is destroyed while loading design time metadata", function(assert) {
		var done = assert.async();

		var oButton = new Button();

		//simulate control being destroyed
		var fnOldLoadDTM = ElementUtil.loadDesignTimeMetadata;
		ElementUtil.loadDesignTimeMetadata = function(){
			return fnOldLoadDTM.apply(arguments).then(function(oDesignTimeMetadata){
				oButton.destroy();
				return oDesignTimeMetadata;
			});
		};

		var fnElementOverlayCreatedSpy = this.spy();
		this.oDesignTime.attachEventOnce("elementOverlayCreated", fnElementOverlayCreatedSpy);

		this.oDesignTime.attachEventOnce("synced", function() {
			assert.equal(fnElementOverlayCreatedSpy.callCount, 0, "then overlay is not published to be created");
			var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
			assert.ok(!oButtonOverlay, "and overlay of destroyed control is also destroyed");

			ElementUtil.loadDesignTimeMetadata = fnOldLoadDTM;
			done();
		});

		this.oOuterLayout.addContent(oButton);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("when new control without overlay is added to a root control and an error happens within the loadDesignTimeMetadata promise chain", function(assert) {
		var done = assert.async();

		var oButton = new Button();
		var someError = new Error("some Error occured");
		this.stub(ElementUtil, "loadDesignTimeMetadata").returns(Promise.reject(someError));

		this.oDesignTime.attachEventOnce("syncFailed", function() {
			assert.ok(true, "then syncFailed is called in an error case");
			done();
		});

		this.oOuterLayout.addContent(oButton);
		sap.ui.getCore().applyChanges();
	});

	QUnit.test("... and the control is moved inside of root element", function(assert) {
		var oOldButtonOverlay = isOverlayForElementInDesignTime(this.oButton1, this.oDesignTime);
		this.oOuterLayout.addContent(this.oButton1);
		var oNewButtonOverlay = isOverlayForElementInDesignTime(this.oButton1, this.oDesignTime);
		assert.strictEqual(oOldButtonOverlay, oNewButtonOverlay, "overlay for button1 is not changed");
	});

	QUnit.test("... and the control is removed from root element", function(assert) {
		var done = assert.async();

		this.oInnerLayout.removeContent(this.oButton1);

		this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
			assert.strictEqual(oEvent.getParameter("overlay").getElementInstance(), this.oButton1, "overlay for button is destroyed");
			done();
			this.oButton1.destroy();
		}.bind(this));
	});

	QUnit.test("when the DesignTime is destroyed", function(assert) {
		this.oDesignTime.destroy();
		assert.strictEqual(isOverlayForElementInDesignTime(this.oOuterLayout, this.oDesignTime), false, "overlay for layout destroyed");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oButton1, this.oDesignTime), false, "overlay for button1 destroyed");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oButton2, this.oDesignTime), false, "overlay for button2 destroyed");
	});

	QUnit.test("when the element inside of the DesignTime is destroyed", function(assert) {
		var done = assert.async();

		this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
			assert.strictEqual(isOverlayForElementInDesignTime(this.oButton1, this.oDesignTime), false, "overlay for button1 destroyed");

			done();
		}, this);

		this.oButton1.destroy();
	});

	QUnit.test("when the element inside of the DesignTime is moved to 'dependents' aggregation", function(assert) {
		var done = assert.async();

		this.oDesignTime.attachEventOnce("elementOverlayDestroyed", function(oEvent) {
			assert.strictEqual(oEvent.getParameter("overlay").getElementInstance(), this.oButton1, "overlay for button is destroyed");
			done();
		}, this);

		this.oInnerLayout.addDependent(this.oButton1);
	});

	QUnit.test("when the overlay is selected inside of the DesignTime", function(assert) {
		var done = assert.async();
		var oOverlay = OverlayRegistry.getOverlay(this.oButton1);

		this.oDesignTime.attachEventOnce("selectionChange", function(oEvent) {
			var aSelection = oEvent.getParameter("selection");
			assert.strictEqual(aSelection.length, 1, "selection is just one overlay");
			assert.strictEqual(aSelection[0], oOverlay, "selection is correct");
			done();
		});

		oOverlay.setSelectable(true);
		oOverlay.setSelected(true);
	});

	QUnit.test("when an overlay is created via API function 'createOverlay'...", function(assert) {
		var done = assert.async();
		var oButton = new Button();
		var oOverlay = this.oDesignTime.createOverlay(oButton);

		oOverlay.setLazyRendering(false);

		this.oDesignTime.attachEventOnce("elementOverlayCreated", function() {
			sap.ui.getCore().applyChanges();
			assert.ok(oOverlay.getDomRef(), "then a created overlay is also visible");
			oOverlay.destroy();
			done();
		});
	});

	QUnit.test("when the DesignTime is disabled", function(assert) {
		this.oDesignTime.setEnabled(false);
		assert.strictEqual(
			jQuery(Overlay.getOverlayContainer()).filter(':visible').length,
			0,
			'then the overlay container has been hidden'
		);
		assert.strictEqual(
			OverlayRegistry.getOverlay(this.oOuterLayout).getEnabled(),
			false,
			'then the outer overlay has been disabled'
		);
		assert.strictEqual(
			OverlayRegistry.getOverlay(this.oOuterLayout).getChildren()[0].getEnabled(),
			false,
			'then the aggregation overlay of outer overlay if disabled'
		);
	});

	QUnit.module("Given that the DesignTime is created for two root controls", {
		beforeEach : function() {
			this.oLayout1 = new VerticalLayout({
				content : []
			});
			this.oLayout2 = new VerticalLayout({
				content : []
			});
			this.oLayout3 = new VerticalLayout({
				content : []
			});
			this.oOuterLayout = new VerticalLayout({
				content : [this.oLayout1, this.oLayout2, this.oLayout3]
			});
			this.oOuterLayout.placeAt("content");

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout1, this.oLayout3]
			});

			sap.ui.getCore().applyChanges();
		},
		afterEach : function() {
			this.oOuterLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the DesignTime is initialized", function(assert) {
		assert.ok(isOverlayForElementInDesignTime(this.oLayout1, this.oDesignTime), "overlay for layout1 exists");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout2, this.oDesignTime), false, "overlay for layout2 doesn't exist");
		assert.ok(isOverlayForElementInDesignTime(this.oLayout3, this.oDesignTime), "overlay for layout3 exists");
	});

	QUnit.test("when the DesignTime is initialized and one root element is removed", function(assert) {
		this.oDesignTime.removeRootElement(this.oLayout3);
		assert.ok(isOverlayForElementInDesignTime(this.oLayout1, this.oDesignTime), "overlay for layout1 exists");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout2, this.oDesignTime), false, "overlay for layout2 doesn't exist");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout3, this.oDesignTime), false, "overlay for layout3 doesn't exist");
	});

	QUnit.test("when the DesignTime is initialized and all root elements are removed", function(assert) {
		this.oDesignTime.removeAllRootElement();
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout1, this.oDesignTime), false, "overlay for layout1 doesn't exist");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout2, this.oDesignTime), false, "overlay for layout2 doesn't exist");
		assert.strictEqual(isOverlayForElementInDesignTime(this.oLayout3, this.oDesignTime), false, "overlay for layout3 doesn't exist");
	});

	QUnit.test("when the DesignTime is initialized and one root element is added", function(assert) {
		this.oDesignTime.addRootElement(this.oLayout2);
		assert.ok(isOverlayForElementInDesignTime(this.oLayout1, this.oDesignTime), "overlay for layout1 exists");
		assert.ok(isOverlayForElementInDesignTime(this.oLayout2, this.oDesignTime), "overlay for layout2 exists");
		assert.ok(isOverlayForElementInDesignTime(this.oLayout3, this.oDesignTime), "overlay for layout3 exists");
	});

	QUnit.module("Given that the DesignTime is created", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oPage = new Page();
			this.oPage.getMetadata().loadDesignTime().then(function() {
				this.oDesignTime = new DesignTime({
					designTimeMetadata : {
						"sap.m.Page" : {
							testField : "testValue"
						}
					},
					rootElements : [this.oPage]
				});
				done();
			}.bind(this));

		},
		afterEach : function() {
			this.oPage.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the DesignTime is initialized with a designTimeMetadata", function(assert) {
		var oDTMetadata = this.oDesignTime.getDesignTimeMetadataFor("sap.m.Page");
		assert.strictEqual(oDTMetadata.testField, "testValue", "Test field is save in DTMetadata");
		var oOverlay = OverlayRegistry.getOverlay(this.oPage);
		assert.strictEqual(oOverlay.getDesignTimeMetadata().getData().testField, "testValue", "DTMetadata from the DT is merged correctly");
		assert.strictEqual(oOverlay.getDesignTimeMetadata().getAggregation("content").domRef, ":sap-domref > section", "UI5 DTMetadata is merged correctly");
	});

	QUnit.done(function( details ) {
		jQuery("#content").hide();
	});
});