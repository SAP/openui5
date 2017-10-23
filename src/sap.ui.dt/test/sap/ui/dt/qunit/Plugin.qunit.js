/* global QUnit sinon */

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
	jQuery.sap.require("sap.ui.layout.form.Form");
	jQuery.sap.require("sap.ui.layout.form.FormContainer");
	jQuery.sap.require("sap.ui.core.Title");

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given that an Plugin is initialized with register methods", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oButton = new sap.m.Button();
			this.oLayout = new sap.ui.layout.VerticalLayout({
				content : [
					this.oButton
				]
			}).placeAt("qunit-fixture");

			this.oDesignTime = new sap.ui.dt.DesignTime({
				rootElements : [this.oLayout]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				sap.ui.getCore().applyChanges();
				this.oButtonOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton);
				this.oLayoutOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout);
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
			sandbox.restore();
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
		var oButtonDTMetadata = this.oButtonOverlay.getDesignTimeMetadata();
		var oLayoutDTMetadata = this.oLayoutOverlay.getDesignTimeMetadata();

		aLayoutAggregationNames.forEach(function(sAggregationName) {
			if (oLayoutDTMetadata.isAggregationIgnored(this.oLayout, sAggregationName) === false) {
				iAggregationCount += 1;
			}
		}.bind(this));
		aButtonAggregationNames.forEach(function(sAggregationName) {
			if (oButtonDTMetadata.isAggregationIgnored(this.oButton, sAggregationName) === false) {
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

		oLayout.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		this.oDesignTime.attachEventOnce("synced", function() {
			var aLayoutAggregationNames = Object.keys(this.oLayout.getMetadata().getAllAggregations());
			var aButtonAggregationNames = Object.keys(this.oButton.getMetadata().getAllAggregations());
			var oButtonDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oButton).getDesignTimeMetadata();
			var oLayoutDTMetadata = sap.ui.dt.OverlayRegistry.getOverlay(this.oLayout).getDesignTimeMetadata();
			this.iLayoutAggregationCount = 0;
			this.iButtonAggregationCount = 0;

			aLayoutAggregationNames.forEach(function(sAggregationName) {
				if (oLayoutDTMetadata.isAggregationIgnored(this.oLayout, sAggregationName) === false) {
					this.iLayoutAggregationCount += 1;
				}
			}.bind(this));
			aButtonAggregationNames.forEach(function(sAggregationName) {
				if (oButtonDTMetadata.isAggregationIgnored(this.oButton, sAggregationName) === false) {
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

	QUnit.test("when the plugin is added and the element overlay syncs its aggregation overlays", function(assert) {
		var done = assert.async();

		this.oDesignTime.addPlugin(this.oPlugin);
		this.oFormContainer = new sap.ui.layout.form.FormContainer("formcontainer", {title: new sap.ui.core.Title({text: "foo"})});
		this.oForm = new sap.ui.layout.form.Form("form",{
			title: new sap.ui.core.Title({text: "Form Title"}),
			editable: true,
			formContainers: [this.oFormContainer]
		});

		this.oDesignTime.attachEventOnce("synced", function() {
			var spy = sinon.spy(this.oPlugin, "callAggregationOverlayRegistrationMethods");

			var oFormContainerElementOverlay = sap.ui.dt.OverlayRegistry.getOverlay(this.oFormContainer);
			var oAggregationOverlay = oFormContainerElementOverlay.getAggregationOverlay("formElements");
			oFormContainerElementOverlay._syncAggregationOverlay(oAggregationOverlay);

			assert.equal(spy.callCount, 1, "the aggregation overlay is registered one time on the plugin");

			done();

		}.bind(this));

		this.oLayout.addContent(this.oForm);
		sap.ui.getCore().applyChanges();

	});

	QUnit.test("when the plugin is added to designTime and then removed from DT", function(assert) {
		this.oDesignTime.addPlugin(this.oPlugin);
		this.oDesignTime.removePlugin(this.oPlugin);
		assert.strictEqual(this.iregisterElementOverlayCalls, 0, "registered overlays are deregistered");
		assert.strictEqual(this.iRegisterAggregationOverlayCalls, 0, "registered aggregations are deregistered");
	});

	QUnit.test("Common methods for plugins", function(assert){
		var aSelection = ["selection1"];
		sandbox.stub(this.oPlugin, "getDesignTime").returns({
			getSelection : function(){
				return aSelection;
			}
		});
		assert.equal(this.oPlugin.isMultiSelectionInactive(), true, "calling 'isMultiSelectionInactive' for a single selection returns true");
		aSelection = ["selection1", "selection2"];
		assert.equal(this.oPlugin.isMultiSelectionInactive(), false, "calling 'isMultiSelectionInactive' for multiple selection returns false");

		this.oPlugin.getActionName = function(){
			return "dummyActionName";
		};
		var oOverlay = {
			getElementInstance : function(){
				return "dummyElement";
			},
			getDesignTimeMetadata : function(){
				return {
					getAction : function(sActionName, oElement){
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

	QUnit.test("When calling _getMenuItems", function(assert){
		var oOverlay = {
			getDesignTimeMetadata : function(){
				return;
			}
		};
		assert.equal(this.oPlugin._getMenuItems(oOverlay).length,
			0,
			"if the overlay has no DesignTime Metadata, the method returns an empty array");
		oOverlay = {
			getElementInstance : function(){
				return "dummyElement";
			},
			getDesignTimeMetadata : function(){
				return {
					getAction : function(sActionName, oElement){
						return {
							name : "dummyActionName"
						};
					},
					getLibraryText : function(sName){
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
			getElementInstance : function(){
				return "dummyElement";
			},
			getDesignTimeMetadata : function(){
				return {
					getAction : function(sActionName, oElement){
						return {};
					}
				};
			}
		};

		assert.equal(this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_RENAME"})[0].text,
			sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
			"the method returns default text when no text is defined in DT Metadata");

		oOverlay = {
			getElementInstance : function(){
				return "dummyElement";
			},
			getDesignTimeMetadata : function(){
				return {
					getAction : function(sActionName, oElement){
						return {
							name : function(oElement){
								return oElement + "name";
							}
						};
					}
				};
			}
		};

		assert.equal(this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_DUMMY_ID"})[0].text,
			"dummyElementname",
			"the method returns the correct text when the name is defined as a function in DT Metadata");

		bIsAvailable = false;
		assert.equal(this.oPlugin._getMenuItems(oOverlay, {pluginId : "CTX_DUMMY_ID"}).length,
			0,
			"then if the plugin is not available no menu items are returned");
	});

})();