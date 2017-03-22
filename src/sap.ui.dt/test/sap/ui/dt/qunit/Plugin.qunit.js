(function(){
	"use strict";
	jQuery.sap.require("sap.ui.thirdparty.sinon");
	jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
	jQuery.sap.require("sap.ui.qunit.qunit-coverage");

	if (window.blanket){
		window.blanket.options("sap-ui-cover-only", "sap/ui/dt");
	}

	jQuery.sap.require("sap.ui.dt.DesignTime");
	jQuery.sap.require("sap.ui.dt.Plugin");

	QUnit.module("Given that an Plugin is initialized with register methods", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton = new sap.m.Button();
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("content");

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				this.oButtonDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
				this.oLayoutDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout).getDesignTimeMetadata();
				done();
			}.bind(this));

			this.oPlugin = new sap.ui.dt.Plugin();
			this.iregisterElementOverlayCalls = 0;
			this.iRegisterAggregationOverlayCalls = 0;
			this.oPlugin.registerElementOverlay = function() {
				this.iregisterElementOverlayCalls += 1;
			}.bind(this);
			this.oPlugin.registerAggregationOverlay = function() {
				this.iRegisterAggregationOverlayCalls += 1;
			}.bind(this);
			this.oPlugin.deregisterElementOverlay = function() {
				this.iregisterElementOverlayCalls -= 1;
			}.bind(this);
			this.oPlugin.deregisterAggregationOverlay = function() {
				this.iRegisterAggregationOverlayCalls -= 1;
			}.bind(this);
		},
		afterEach : function() {
			this.oButton.destroy();
			this.oLayout.destroy();
			this.oDesignTime.destroy();
			this.oPlugin.destroy();
		}
	});

	QUnit.test("when the plugin is added to designTime with two controls", function(assert) {
		this.oDesignTime.addPlugin(this.oPlugin);
		assert.strictEqual(this.iregisterElementOverlayCalls, 2, "register was called for two overlays");
		var iAggregationCount = 0;
		var aLayoutAggregationNames = Object.keys(this.oLayout.getMetadata().getAllAggregations());
		var aButtonAggregationNames = Object.keys(this.oButton.getMetadata().getAllAggregations());

		aLayoutAggregationNames.forEach(function(sAggregationName) {
			if(this.oLayoutDTMetadata.isAggregationIgnored(this.oLayout, sAggregationName) === false) {
				iAggregationCount += 1;
			}
		}.bind(this));
		aButtonAggregationNames.forEach(function(sAggregationName) {
			if(this.oButtonDTMetadata.isAggregationIgnored(this.oButton, sAggregationName) === false) {
				iAggregationCount += 1;
			}
		}.bind(this));

		assert.strictEqual(this.iRegisterAggregationOverlayCalls, iAggregationCount, "register was called for all aggregation overlays");
	});

	QUnit.test("when the plugin is added to designTime and new controls are added to designTime as root control and inside the controls", function(assert) {
		var doneSyncingNewRootControl = assert.async();

		var oButton = new sap.m.Button();
		var oLayout = new sap.ui.layout.VerticalLayout({
			content : oButton
		});

		this.oDesignTime.addPlugin(this.oPlugin);
		this.iregisterElementOverlayCalls = 0;
		this.iRegisterAggregationOverlayCalls = 0;

		oLayout.placeAt("content");
		sap.ui.getCore().applyChanges();

		this.oDesignTime.attachEventOnce("synced", function() {
			var iAggregationCount = 0;

			var aLayoutAggregationNames = Object.keys(this.oLayout.getMetadata().getAllAggregations());
			var aButtonAggregationNames = Object.keys(this.oButton.getMetadata().getAllAggregations());
			var oButtonDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
			var oLayoutDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout).getDesignTimeMetadata();
			this.iLayoutAggregationCount = 0;
			this.iButtonAggregationCount = 0;

			aLayoutAggregationNames.forEach(function(sAggregationName) {
				if(oLayoutDTMetadata.isAggregationIgnored(this.oLayout, sAggregationName) === false) {
					this.iLayoutAggregationCount += 1;
				}
			}.bind(this));
			aButtonAggregationNames.forEach(function(sAggregationName) {
				if(oButtonDTMetadata.isAggregationIgnored(this.oButton, sAggregationName) === false) {
					this.iButtonAggregationCount += 1;
				}
			}.bind(this));

			assert.strictEqual(this.iregisterElementOverlayCalls, 2, "register was called for all new control");
			assert.strictEqual(this.iRegisterAggregationOverlayCalls, this.iLayoutAggregationCount + this.iButtonAggregationCount, "register was called for all new aggregations");

			doneSyncingNewRootControl();

			var doneSyncingNewControl = assert.async();
			this.iregisterElementOverlayCalls = 0;
			this.iRegisterAggregationOverlayCalls = 0;

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.iregisterElementOverlayCalls, 1, "register was called for all new control");
				assert.strictEqual(this.iRegisterAggregationOverlayCalls, this.iButtonAggregationCount, "register was called for all new aggregations");

				doneSyncingNewControl();
			}.bind(this));

			oLayout.addContent(new sap.m.Button());
			sap.ui.getCore().applyChanges();

		}.bind(this));

		this.oDesignTime.addRootElement(oLayout);
	});

	QUnit.test("when the plugin is added to designTime and then removed from DT", function(assert) {
		this.oDesignTime.addPlugin(this.oPlugin);
		this.oDesignTime.removePlugin(this.oPlugin);
		assert.strictEqual(this.iregisterElementOverlayCalls, 0, "registered overlays are deregistered");
		assert.strictEqual(this.iRegisterAggregationOverlayCalls, 0, "registered aggregations are deregistered");
	});

})();
