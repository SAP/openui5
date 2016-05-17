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
	jQuery.sap.require("sap.ui.dt.command.CommandFactory");

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
			var that = this;
			this.oPlugin.registerElementOverlay = function() {
				that.iregisterElementOverlayCalls += 1;
			};
			this.oPlugin.registerAggregationOverlay = function() {
				that.iRegisterAggregationOverlayCalls += 1;
			};
			this.oPlugin.deregisterElementOverlay = function() {
				that.iregisterElementOverlayCalls -= 1;
			};
			this.oPlugin.deregisterAggregationOverlay = function() {
				that.iRegisterAggregationOverlayCalls -= 1;
			};
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

	QUnit.test("when the plugin is added to designTime and new controls are added to designTime", function(assert) {
		var done = assert.async();
		var that = this;

		var oButton = new sap.m.Button();
		var oLayout = new sap.ui.layout.VerticalLayout({
			content : oButton
		});

		this.oDesignTime.addPlugin(this.oPlugin);
		this.iregisterElementOverlayCalls = 0;
		this.iRegisterAggregationOverlayCalls = 0;

		oLayout.placeAt("content");
		sap.ui.getCore().applyChanges();

		this.oDesignTime.addRootElement(oLayout);

		this.oDesignTime.attachEventOnce("synced", function() {
			assert.strictEqual(that.iregisterElementOverlayCalls, 2, "register was called for all new control");
			assert.strictEqual(that.iRegisterAggregationOverlayCalls, Object.keys(oLayout.getMetadata().getAllAggregations()).length + Object.keys(oButton.getMetadata().getAllAggregations()).length , "register was called for all new aggregations");

			done();
		});
	});

	QUnit.test("when the plugin is added to designTime and then removed from DT", function(assert) {
		var oLayout = new sap.ui.layout.VerticalLayout();

		this.oDesignTime.addPlugin(this.oPlugin);
		this.oDesignTime.removePlugin(this.oPlugin);
		assert.strictEqual(this.iregisterElementOverlayCalls, 0, "registered overlays are deregistered");
		assert.strictEqual(this.iRegisterAggregationOverlayCalls, 0, "registered aggregations are deregistered");
	});

	QUnit.module("Given a plugin with command factory", {
		beforeEach : function(){
			var that = this;
			this.oButton = new sap.m.Button();

			this.fakeMovePlugin = new sap.ui.dt.Plugin({
				commandFactory : sap.ui.dt.command.CommandFactory
			});
			
			this.fakeMovePlugin.triggerFakeAction = function(){
				var cmd = this.getCommandFactory().getCommandFor(that.oButton, "Move");
				this.fireElementModified({ "command" : cmd});
			}
		},
		afterEach : function() {
			this.oButton.destroy();
			this.fakeMovePlugin.destroy();
		}
	});

	QUnit.test("when triggering an action", function(assert){
		var done = assert.async();
		this.fakeMovePlugin.attachElementModified(function(oEvent){
			assert.equal(oEvent.getParameter("command").getName(), "Move", "then a command is emitted");
			done();
		});

		this.fakeMovePlugin.triggerFakeAction();
	});
})();
