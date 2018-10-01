/*global QUnit */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/layout/VerticalLayout",
	"sap/m/HBox",
	"sap/m/VBox",
	"sap/m/Button",
	"sap/ui/rta/plugin/Stretch"
],
function (
	jQuery,
	sinon,
	DesignTime,
	OverlayRegistry,
	VerticalLayout,
	HBox,
	VBox,
	Button,
	Stretch
) {
	'use strict';

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested editable containers", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oVBox1 = new VBox("vbox1", {
						width: "300px",
						items: [
							new VBox("vbox11", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox12", {
								width: "300px",
								items: new Button()
							})
						]
					}),
					this.oVBox2 = new VBox("vbox2", {
						width: "300px",
						items: [
							new VBox("vbox21", {
								width: "300px",
								items: new Button()
							}),
							new VBox("vbox22", {
								width: "300px",
								items: new Button()
					})
				]
					})
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.oStretchPlugin = new Stretch();
			sandbox.stub(this.oStretchPlugin, "_isEditable").returns(true);

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [this.oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oVBoxOverlay1 = OverlayRegistry.getOverlay(this.oVBox1);
				this.oVBoxOverlay2 = OverlayRegistry.getOverlay(this.oVBox2);
				done();
			}.bind(this));
		},
		afterEach : function() {
			this.oDesignTime.destroy();
			this.oLayout.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was set");
			assert.ok(this.oVBox1.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was set");
			assert.ok(this.oVBox2.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was set");
		});

		QUnit.test("when the plugin gets deregistered", function(assert) {
			this.oStretchPlugin.deregisterElementOverlay(this.oLayoutOverlay);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay1);
			this.oStretchPlugin.deregisterElementOverlay(this.oVBoxOverlay2);
			assert.notOk(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was removed");
			assert.notOk(this.oVBox1.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was removed");
			assert.notOk(this.oVBox2.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was removed");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (not all editable)", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button("button")
							})
						]
					})
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oStretchPlugin = new Stretch();
			sandbox.stub(oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElementInstance().getId() === "hbox") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.ok(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was set");
			assert.notOk(this.oHBox.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was not set");
		});

		QUnit.skip("When the editable child becomes not editable", function(assert) {
			// TODO
			// Not working in the first version, needs to be implemented
			this.oVBoxOverlay.setEditable(false);
			assert.notOk(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was removed");
		});

		QUnit.test("When the layout becomes not editable", function(assert) {
			this.oLayoutOverlay.setEditable(false);
			assert.notOk(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was removed");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with only a hbox in a layout (not all editable)", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px"
					}),
					this.oHBox2 = new HBox("hbox2", {
						visible: false
					})
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oStretchPlugin = new Stretch();
			sandbox.stub(oStretchPlugin, "_isEditable").callsFake(function(oOverlay) {
				if (oOverlay.getElementInstance().getId() === "hbox") {
					return false;
				}
				return true;
			});

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(this.oLayout.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was not set");
			assert.notOk(this.oHBox.hasStyleClass("sapUiRtaStretchPaddingTop"), "the style class was not set");
		});
	});

	QUnit.module("Given a designTime and stretch plugin are instantiated with nested containers (editable not stubbed)", {
		beforeEach : function(assert) {
			var done = assert.async();
			this.oLayout = new VerticalLayout("layout", {
				width: "300px",
				content: [
					this.oHBox = new HBox("hbox", {
						width: "300px",
						items: [
							this.oVBox = new VBox("vbox", {
								width: "300px",
								items: new Button("button")
							})
						]
					})
				]
			});
			this.oLayout.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			var oStretchPlugin = new Stretch();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oLayout],
				plugins : [oStretchPlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oLayout);
				this.oHBoxOverlay = OverlayRegistry.getOverlay(this.oHBox);
				this.oVBoxOverlay = OverlayRegistry.getOverlay(this.oVBox);
				done();
			}.bind(this));
		},
		afterEach : function() {
			sandbox.restore();
			this.oDesignTime.destroy();
			this.oLayout.destroy();
		}
	}, function() {
		QUnit.test("After initialization", function(assert) {
			assert.notOk(this.oLayoutOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oHBoxOverlay.getEditable(), "no overlay is editable");
			assert.notOk(this.oVBoxOverlay.getEditable(), "no overlay is editable");
		});
	});

	QUnit.done(function () {
		jQuery("#qunit-fixture").hide();
	});
});
