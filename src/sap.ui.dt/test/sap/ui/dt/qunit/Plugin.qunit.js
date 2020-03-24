/* global QUnit */

sap.ui.define([
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Plugin",
	"sap/m/Button",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4"
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
			sap.ui.getCore().applyChanges();

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
			this.fnGetResponsibleElement = function () {};
			this.fnGetAction = function () {};
			this.fnGetData = function () {};
			this.oOverlay = {
				getElement: function () {
					return "dummyElement";
				},
				getDesignTimeMetadata: function () {
					return {
						getData: this.fnGetData,
						getAction: this.fnGetAction,
						getResponsibleElement: this.fnGetResponsibleElement
					};
				}.bind(this)
			};
		},
		afterEach: function () {
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("when using common methods of the plugin", function (assert) {
			assert.expect(6);
			this.oPlugin.getActionName = function () {
				return "dummyActionName";
			};
			this.fnGetAction = function (sActionName, oElement) {
				assert.equal(sActionName, "dummyActionName", "getAction gets called with the plugin action name");
				assert.equal(oElement, "dummyElement", "getAction gets called with the right element");
			};
			this.oPlugin.getAction(this.oOverlay);

			assert.equal(this.oPlugin.isAvailable(), false, "by default the plugin returns false");
			assert.equal(this.oPlugin.isEnabled(), false, "by default the plugin returns false");
			assert.equal(this.oPlugin.isBusy(), false, "by default the plugin returns false");

			sandbox.stub(this.oPlugin, "getDesignTime").returns({
				getSelectionManager: function () {
					return {
						get: function () {
							assert.ok(true, "the function was called");
						}
					};
				}
			});
			this.oPlugin.getSelectedOverlays();
		});

		QUnit.test("when getResponsibleElementOverlay() is called for an element overlay, with no responsible element", function (assert) {
			assert.deepEqual(this.oPlugin.getResponsibleElementOverlay(this.oOverlay, "dummyAction"), this.oOverlay, "then the menu item from the responsible element is returned");
		});

		QUnit.test("when isResponsibleElementActionAvailable() is called for an element overlay with no designTimeMetadata", function (assert) {
			this.oOverlay.getDesignTimeMetadata = function () {};
			assert.strictEqual(this.oPlugin.isResponsibleElementActionAvailable(this.oOverlay), false, "then false is returned");
		});

		QUnit.test("when isResponsibleElementActionAvailable() is called for an element overlay with designTimeMetadata and default action name", function (assert) {
			assert.expect(2);
			var sActionName = "dummyActionEnabled";
			this.oPlugin.getActionName = function () {
				return sActionName;
			};
			this.oOverlay.getDesignTimeMetadata = function () {
				return {
					isResponsibleActionAvailable: function () {
						assert.strictEqual(arguments[0], sActionName, "then the default action name was passed to designTimeMetadata.isResponsibleActionAvailable()");
						return true;
					}
				};
			};
			assert.strictEqual(this.oPlugin.isResponsibleElementActionAvailable(this.oOverlay), true);
		});

		QUnit.test("when isResponsibleElementActionAvailable() is called for an element overlay with designTimeMetadata and custom action name", function (assert) {
			assert.expect(2);
			var sActionName = "dummyActionEnabled";

			this.oOverlay.getDesignTimeMetadata = function () {
				return {
					isResponsibleActionAvailable: function () {
						assert.strictEqual(arguments[0], sActionName, "then the custom action name was passed to designTimeMetadata.isResponsibleActionAvailable()");
						return true;
					}
				};
			};
			assert.strictEqual(this.oPlugin.isResponsibleElementActionAvailable(this.oOverlay, sActionName), true);
		});

		QUnit.test("when getResponsibleElementOverlay() is called for an element overlay, with a responsible element and action derived from getActionName()", function (assert) {
			assert.expect(2);
			var oResponsibleElement = new Button("responsibleElement");
			this.oPlugin.getActionName = function () {
				return "dummyAction";
			};
			var oResponsibleElementOverlay = {type: "responsibleElementOverlay"};
			sandbox.stub(OverlayRegistry, "getOverlay").withArgs(oResponsibleElement).returns(oResponsibleElementOverlay);

			this.fnGetResponsibleElement = function (oElement) {
				assert.equal(oElement, "dummyElement", "then getResponsibleElement() called to retrieve the responsible element with the correct action");
				return oResponsibleElement;
			};
			oResponsibleElement.destroy();
			assert.deepEqual(this.oPlugin.getResponsibleElementOverlay(this.oOverlay), oResponsibleElementOverlay, "then the menu item from the responsible element is returned");
		});

		QUnit.test("when getResponsibleElementOverlay() is called for an element overlay, with a responsible element and action derived from the passed parameter", function (assert) {
			assert.expect(2);
			var oResponsibleElement = new Button("responsibleElement");
			var oResponsibleElementOverlay = {type: "responsibleElementOverlay"};
			sandbox.stub(OverlayRegistry, "getOverlay").withArgs(oResponsibleElement).returns(oResponsibleElementOverlay);

			this.fnGetResponsibleElement = function (oElement) {
				assert.equal(oElement, "dummyElement", "then getResponsibleElement() called to retrieve the responsible element with the correct action");
				return oResponsibleElement;
			};

			oResponsibleElement.destroy();
			assert.deepEqual(this.oPlugin.getResponsibleElementOverlay(this.oOverlay, "dummyAction"), oResponsibleElementOverlay, "then the menu item from the responsible element is returned");
		});

		QUnit.test("when getResponsibleElementOverlay() is called for an element overlay, with no designTimeMetadata", function (assert) {
			var oResponsibleElement = "responsibleElement";
			var oResponsibleElementOverlay = {type: "responsibleElementOverlay"};
			sandbox.stub(OverlayRegistry, "getOverlay").withArgs(oResponsibleElement).returns(oResponsibleElementOverlay);
			assert.deepEqual(this.oPlugin.getResponsibleElementOverlay(this.oOverlay, "dummyAction"), this.oOverlay, "then the source overlay is returned");
		});

		QUnit.test("when getResponsibleElementOverlay() is called for an element overlay with an error while retrieving the responsible element", function (assert) {
			sandbox.stub(OverlayRegistry, "getOverlay").throws();
			this.fnGetResponsibleElement = function () {
				return {};
			};
			assert.deepEqual(this.oPlugin.getResponsibleElementOverlay(this.oOverlay), this.oOverlay, "then the source overlay is returned");
		});
	});

	QUnit.module("Given that _getMenuItems is called for an overlay", {
		beforeEach: function () {
			this.oPlugin = new Plugin();
			this.oPlugin.handler = function () {
				return true;
			};
			this.oPlugin.isAvailable = function () {
				return true;
			};
			this.oPlugin.isEnabled = function () {
				return true;
			};
			this.oPlugin.getActionName = function () {
				return "dummyActionName";
			};
			this.fnGetResponsibleElement = function () {};
			this.fnGetAction = function () {};
			this.fnGetData = function () {
				return {
					actions: {}
				};
			};
			this.fnIsResponsibleActionAvailable = function () {};
			this.fnGetLibraryText = function () {};
			this.oOverlay = {
				getElement: function () {
					return "dummyElement";
				},
				getDesignTimeMetadata: function () {
					return {
						getData: this.fnGetData,
						getAction: this.fnGetAction,
						getResponsibleElement: this.fnGetResponsibleElement,
						getLibraryText: this.fnGetLibraryText,
						isResponsibleActionAvailable: this.fnIsResponsibleActionAvailable
					};
				}.bind(this)
			};
		},
		afterEach: function () {
			this.oPlugin.destroy();
			sandbox.restore();
		}
	}, function () {
		QUnit.test("with no designTimeMetadata", function (assert) {
			assert.equal(
				this.oPlugin._getMenuItems([this.oOverlay], {}).length,
				0,
				"then an an empty array is returned"
			);
		});

		QUnit.test("when there is a defined action name", function (assert) {
			this.fnGetAction = function () {
				return {
					name: "dummyActionName"
				};
			};
			this.fnGetLibraryText = function (oElement, sName) {
				return sName;
			};

			var mMenuItem = this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "dummyPluginId", rank: 10})[0];

			assert.equal(mMenuItem.id, "dummyPluginId", "the method returns the right ID for the menu item");
			assert.equal(mMenuItem.text, "dummyActionName", "the method returns the right text when it is defined in DT Metadata");
			assert.equal(mMenuItem.rank, 10, "the method returns the right rank for the menu item");
			assert.ok(mMenuItem.handler(), "handler function is properly returned");
			assert.ok(mMenuItem.enabled(), "enabled function is properly returned");
		});

		QUnit.test("when there is an undefined action name", function (assert) {
			this.fnGetAction = function () {
				return {};
			};

			assert.equal(
				this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "CTX_RENAME"})[0].text,
				sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
				"then default text is returned in the menu item"
			);
		});

		QUnit.test("when there is action name defined as a function", function (assert) {
			this.fnGetAction = function () {
				return {
					name: function (oElement) {
						return oElement + "name";
					}
				};
			};

			assert.equal(
				this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "CTX_DUMMY_ID"})[0].text,
				"dummyElementname",
				"then correct text is returned in the menu item"
			);
		});

		QUnit.test("when the plugin is not available", function (assert) {
			this.fnGetAction = function () {
				return {};
			};
			this.oPlugin.isAvailable = function () {
				return false;
			};
			assert.equal(
				this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "CTX_DUMMY_ID"}).length,
				0,
				"then no menu items are returned"
			);
		});

		QUnit.test("when an action is enabled on a responsible element's overlay and _getMenuItems() is called", function (assert) {
			assert.expect(4);
			this.oPlugin.isAvailable = sandbox.stub();
			var oResponsibleElement = new Button("responsibleElement");
			var oResponsibleElementOverlay = {
				getElement: function () {
					return oResponsibleElement;
				},
				getDesignTimeMetadata: function () {
					return {
						getAction: function () {
							return {};
						}
					};
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").withArgs(oResponsibleElement).returns(oResponsibleElementOverlay);

			this.fnGetResponsibleElement = function (oElement) {
				assert.equal(oElement, "dummyElement", "then getResponsibleElement() called to retrieve the responsible element");
				return oResponsibleElement;
			};
			this.fnIsResponsibleActionAvailable = function() {
				assert.equal(arguments[0], "dummyActionName", "then designTimeMetadata.isResponsibleActionAvailable() called with the plugin action name");
				return true;
			};

			// when action is not available on the source overlay
			// but it is available on the responsible element overlay
			this.oPlugin.isAvailable
				.withArgs([this.oOverlay]).returns(false)
				.withArgs([oResponsibleElementOverlay]).returns(true);

			var aMenuItems = this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "CTX_RENAME"});
			assert.equal(
				aMenuItems[0].text,
				sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
				"then the menu item from the responsible element is returned"
			);
			oResponsibleElement.destroy();
			assert.deepEqual(aMenuItems[0].responsible[0], oResponsibleElementOverlay, "then the responsible element overlay was attached to the menu item");
		});

		QUnit.test("when an action is enabled on a responsible element's overlay, but disabled on the source overlay and _getMenuItems() is called", function (assert) {
			assert.expect(3);
			this.oPlugin.isAvailable = sandbox.stub();
			var oResponsibleElement = new Button("responsibleElement");
			var oResponsibleElementOverlay = {
				getElement: function () {
					return oResponsibleElement;
				}
			};
			sandbox.stub(OverlayRegistry, "getOverlay").withArgs(oResponsibleElement).returns(oResponsibleElementOverlay);

			this.fnGetAction = function () {
				return {};
			};
			this.fnGetResponsibleElement = function (oElement) {
				assert.equal(oElement, "dummyElement", "then getResponsibleElement() called to retrieve the responsible element");
				return oResponsibleElement;
			};
			this.fnIsResponsibleActionAvailable = function() {
				assert.equal(arguments[0], "dummyActionName", "then designTimeMetadata.isResponsibleActionAvailable() called with the plugin action name");
				return false;
			};

			// when action is not available on the source overlay
			// but it is available on the responsible element overlay
			this.oPlugin.isAvailable
				.withArgs([oResponsibleElementOverlay]).returns(false)
				.withArgs([this.oOverlay]).returns(true);

			var aMenuItems = this.oPlugin._getMenuItems([this.oOverlay], {pluginId: "CTX_RENAME"});
			assert.equal(
				aMenuItems[0].text,
				sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta").getText("CTX_RENAME"),
				"then the menu item from the responsible element is returned"
			);
			oResponsibleElement.destroy();
			assert.strictEqual(aMenuItems[0].responsible, undefined, "then there was no attached responsible element");
		});
	});

	QUnit.done(function() {
		jQuery("#qunit-fixture").hide();
	});
});
