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
				done();
			});

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
		var iAggregationCount = Object.keys(this.oLayout.getMetadata().getAllAggregations()).length + Object.keys(this.oButton.getMetadata().getAllAggregations()).length;
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
			assert.strictEqual(this.iregisterElementOverlayCalls, 2, "register was called for all new control");
			assert.strictEqual(this.iRegisterAggregationOverlayCalls, Object.keys(oLayout.getMetadata().getAllAggregations()).length + Object.keys(oButton.getMetadata().getAllAggregations()).length , "register was called for all new aggregations");

			doneSyncingNewRootControl();

			var doneSyncingNewControl = assert.async();
			this.iregisterElementOverlayCalls = 0;
			this.iRegisterAggregationOverlayCalls = 0;

			this.oDesignTime.attachEventOnce("synced", function() {
				assert.strictEqual(this.iregisterElementOverlayCalls, 1, "register was called for all new control");
				assert.strictEqual(this.iRegisterAggregationOverlayCalls, Object.keys(oButton.getMetadata().getAllAggregations()).length , "register was called for all new aggregations");

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
