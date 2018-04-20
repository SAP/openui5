/* global QUnit */

QUnit.config.autostart = false;

sap.ui.require([
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/dt/Plugin',
	'sap/m/Button',
	'sap/ui/layout/VerticalLayout',
	'jquery.sap.global',
	'sap/ui/thirdparty/sinon'
],
function(
	DesignTime,
	OverlayRegistry,
	Plugin,
	Button,
	VerticalLayout,
	jQuery,
	sinon
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that a Plugin is initialized with register methods", {
		beforeEach: function(assert) {
			var fnDone = assert.async();

			this.oButton = new Button();
			this.oLayout = new VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			this.oDesignTime = new DesignTime({
				rootElements: [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				fnDone();
			}, this);

			this.oPlugin = new Plugin();

			this.iRegisterElementOverlayCalls = 0;
			this.oPlugin.registerElementOverlay = function() { this.iRegisterElementOverlayCalls++; }.bind(this);
			this.oPlugin.deregisterElementOverlay = function() { this.iRegisterElementOverlayCalls--; }.bind(this);

			this.iRegisterAggregationOverlayCalls = 0;
			this.oPlugin.registerAggregationOverlay = function() { this.iRegisterAggregationOverlayCalls++; }.bind(this);
			this.oPlugin.deregisterAggregationOverlay = function() { this.iRegisterAggregationOverlayCalls--; }.bind(this);
		},
		afterEach: function() {
			this.oLayout.destroy();
			this.oPlugin.destroy();
			this.oDesignTime.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when the plugin is added to designTime with two controls", function(assert) {
			this.oDesignTime.addPlugin(this.oPlugin);
			assert.strictEqual(this.iRegisterElementOverlayCalls, 2, "register was called for two overlays");
			assert.strictEqual(
				this.iRegisterAggregationOverlayCalls,
				this.oButtonOverlay.getAggregationNames().length + this.oLayoutOverlay.getAggregationNames().length,
				"register was called for all aggregation overlays"
			);
		});
		QUnit.test("when the plugin is added to designTime and new controls are added to designTime as root control and inside the controls", function(assert) {
			var fnDone = assert.async();

			var oButton = new Button();
			var oLayout = new VerticalLayout({
				content: oButton
			});
			oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oDesignTime.addPlugin(this.oPlugin);
			this.iRegisterElementOverlayCalls = 0;
			this.iRegisterAggregationOverlayCalls = 0;

			this.oDesignTime.attachEventOnce("synced", function() {
				var oButtonOverlay = OverlayRegistry.getOverlay(oButton);
				var oLayoutOverlay = OverlayRegistry.getOverlay(oLayout);

				assert.strictEqual(this.iRegisterElementOverlayCalls, 2, "register was called for all new control");
				assert.strictEqual(
					this.iRegisterAggregationOverlayCalls,
					oButtonOverlay.getAggregationNames().length + oLayoutOverlay.getAggregationNames().length,
					"register was called for all new aggregations"
				);

				this.iRegisterElementOverlayCalls = 0;
				this.iRegisterAggregationOverlayCalls = 0;

				this.oDesignTime.attachEventOnce("synced", function() {
					assert.strictEqual(this.iRegisterElementOverlayCalls, 1, "register was called for all new control");
					assert.strictEqual(
						this.iRegisterAggregationOverlayCalls,
						OverlayRegistry.getOverlay(oButton2).getAggregationNames().length,
						"register was called for all new aggregations"
					);
					oLayout.destroy();
					fnDone();
				}, this);

				var oButton2 = new Button();
				oLayout.addContent(oButton2);
			}, this);

			this.oDesignTime.addRootElement(oLayout);
		});
		QUnit.test("when the plugin is added to DesignTime and then removed from DesignTime instance", function(assert) {
			this.oDesignTime.addPlugin(this.oPlugin);
			this.oDesignTime.removePlugin(this.oPlugin);
			assert.strictEqual(this.iRegisterElementOverlayCalls, 0, "registered overlays are deregistered");
			assert.strictEqual(this.iRegisterAggregationOverlayCalls, 0, "registered aggregations are deregistered");
		});
	});

	QUnit.module("Given that a Plugin is initialized", {
		beforeEach: function () {
			this.oPlugin = new Plugin();
		},
		afterEach: function () {
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when using common methods of the plugin", function (assert) {
			var aSelection = ["selection1"];
			sandbox.stub(this.oPlugin, "getDesignTime").returns({
				getSelectionManager : function(){
					return {
						get: function(){
							return aSelection;
						}
					};
				}
			});
			assert.equal(this.oPlugin.isMultiSelectionInactive(), true, "calling 'isMultiSelectionInactive' for a single selection returns true");
			aSelection = ["selection1", "selection2"];
			assert.equal(this.oPlugin.isMultiSelectionInactive(), false, "calling 'isMultiSelectionInactive' for multiple selection returns false");

			this.oPlugin.getActionName = function(){
				return "dummyActionName";
			};
			var oOverlay = {
				getElement: function(){
					return "dummyElement";
				},
				getDesignTimeMetadata: function(){
					return {
						getAction: function(sActionName, oElement){
							assert.equal(sActionName, "dummyActionName", "getAction gets called with the plugin action name");
							assert.equal(oElement, "dummyElement", "getAction gets called with the right element");
						}
					};
				}
			};
			this.oPlugin.getAction(oOverlay);

			this.oPlugin._isEditableByPlugin = function(oOverlay){
				assert.equal(oOverlay, "dummyOverlay", "when calling 'isAvailable', _isEditableByPlugin method of the plugin is called by default with the right overlay");
			};

			this.oPlugin.isAvailable("dummyOverlay");
		});
		QUnit.test("when calling _getMenuItems", function(assert){
			var oOverlay = {
				getDesignTimeMetadata: function(){
					return;
				}
			};
			assert.equal(
				this.oPlugin._getMenuItems(oOverlay).length,
				0,
				"if the overlay has no DesignTime Metadata, the method returns an empty array"
			);
			oOverlay = {
				getElement: function(){
					return "dummyElement";
				},
				getDesignTimeMetadata: function(){
					return {
						getAction: function(sActionName, oElement){
							return {
								name: "dummyActionName"
							};
						},
						getLibraryText: function(oElement, sName){
							return sName;
						}
					};
				}
			};

			var bIsAvailable = true;

			this.oPlugin.handler = function(){
				return true;
			};
			this.oPlugin.isAvailable = function(){
				return bIsAvailable;
			};
			this.oPlugin.isEnabled = function(){
				return true;
			};

			var mMenuItem = this.oPlugin._getMenuItems(oOverlay, {pluginId : "dummyPluginId", rank: 10})[0];

			assert.equal(mMenuItem.id, "dummyPluginId", "the method returns the right ID for the menu item");
			assert.equal(mMenuItem.text, "dummyActionName", "the method returns the right text when it is defined in DT Metadata");
			assert.equal(mMenuItem.rank, 10, "the method returns the right rank for the menu item");
			assert.ok(mMenuItem.handler(), "handler function is properly returned");
			assert.ok(mMenuItem.enabled(), "enabled function is properly returned");

			oOverlay = {
				getElement: function(){
					return "dummyElement";
				},
				getDesignTimeMetadata: function(){
					return {
						getAction: function(sActionName, oElement){
							return {};
						}
					};
				}
			};

			assert.equal(
				this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_RENAME"})[0].text,
				sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
				"the method returns default text when no text is defined in DT Metadata"
			);

			oOverlay = {
				getElement: function(){
					return "dummyElement";
				},
				getDesignTimeMetadata: function(){
					return {
						getAction: function(sActionName, oElement){
							return {
								name: function(oElement){
									return oElement + "name";
								}
							};
						}
					};
				}
			};

			assert.equal(
				this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_DUMMY_ID"})[0].text,
				"dummyElementname",
				"the method returns the correct text when the name is defined as a function in DT Metadata"
			);

			bIsAvailable = false;
			assert.equal(
				this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_DUMMY_ID"}).length,
				0,
				"then if the plugin is not available no menu items are returned"
			);
		});
	});

	QUnit.done(function( details ) {
		jQuery("#qunit-fixture").hide();
	});
});
