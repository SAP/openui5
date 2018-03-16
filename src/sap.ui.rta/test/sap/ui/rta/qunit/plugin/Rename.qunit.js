/* global QUnit, sinon*/

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.require([
	"sap/ui/layout/VerticalLayout",
	"sap/ui/dt/DesignTime",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/fl/registry/ChangeRegistry",
	"sap/ui/layout/form/FormContainer",
	"sap/ui/layout/form/Form",
	"sap/ui/layout/form/FormLayout",
	"sap/ui/rta/plugin/Rename",
	"sap/ui/rta/plugin/RenameHandler",
	"sap/ui/core/Title",
	"sap/m/Button",
	"sap/m/Label"
],
function(
	VerticalLayout,
	DesignTime,
	CommandFactory,
	OverlayRegistry,
	ChangeRegistry,
	FormContainer,
	Form,
	FormLayout,
	RenamePlugin,
	RenameHandler,
	Title,
	Button,
	Label
) {
	"use strict";

	QUnit.start();

	var sandbox = sinon.sandbox.create();

	QUnit.module("Given a designTime and rename plugin are instantiated", {
		beforeEach : function(assert) {
			var that = this;
			var done = assert.async();

			var oChangeRegistry = ChangeRegistry.getInstance();
			oChangeRegistry.registerControlsForChanges({
				"sap.ui.layout.form.FormContainer" : {
					"renameGroup": { completeChangeContent: function () {} }
				}
			});

			this.oRenamePlugin = new RenamePlugin({
				commandFactory : new CommandFactory()
			});

			this.oFormContainer = new FormContainer("formContainer",{
				title: new Title("title", {
					text: "title"
				})
			});

			this.oForm = new Form("form", {
				formContainers: [this.oFormContainer],
				layout: new FormLayout({
				})
			});

			this.oVerticalLayout = new VerticalLayout({
				content : [this.oForm]
			}).placeAt("content");

			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oForm],
				plugins : [this.oRenamePlugin]
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				that.oFormOverlay = OverlayRegistry.getOverlay(that.oForm);
				that.oFormContainerOverlay = OverlayRegistry.getOverlay(that.oFormContainer);
				that.oFormContainerOverlay.setSelectable(true);
				done();
			});

		},
		afterEach : function(assert) {
			sandbox.restore();
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when _onDesignTimeSelectionChange is called", function(assert) {
		var aSelection = [this.oFormContainerOverlay];
		var oEvent = {
			getParameter : function() {
				return aSelection;
			}
		};

		RenameHandler._onDesignTimeSelectionChange.call(this.oRenamePlugin, oEvent);

		assert.strictEqual(aSelection, this.oRenamePlugin._aSelection, "then the arrays of selection are equal");
		assert.strictEqual(this.oRenamePlugin._aSelection.length, 1, "then the array of selection has only one selected overlay");
	});

	QUnit.test("when _isEditable is called", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({
			actions: {
				rename: {
					changeType: "renameGroup",
					domRef: function(oFormContainer) {
						return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
					}
				}
			}
		});
		this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
		this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

		assert.strictEqual(this.oRenamePlugin._isEditable(this.oFormContainerOverlay), true, "then the overlay is editable");
		assert.strictEqual(this.oRenamePlugin.isAvailable(this.oFormContainerOverlay), true, "then rename is available for the overlay");
	});

	QUnit.test("when isAvailable and isEnabled are called", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({
			actions: {
				rename: {
					changeType: "renameGroup",
					isEnabled: function(oFormContainer) {
						return !(oFormContainer.getToolbar() || !oFormContainer.getTitle());
					},
					domRef: function(oFormContainer) {
						return jQuery(oFormContainer.getRenderedDomRef()).find(".sapUiFormTitle")[0];
					}
				}
			}
		});
		this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
		this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

		assert.strictEqual(this.oRenamePlugin.isAvailable(this.oFormContainerOverlay), true, "then rename is available for the overlay");
		assert.strictEqual(this.oRenamePlugin.isEnabled(this.oFormContainerOverlay), true, "then rename is enabled for the overlay");
		assert.strictEqual(this.oRenamePlugin._isEditable(this.oFormContainerOverlay), true, "then rename is editable for the overlay");
	});

	QUnit.test("when retrieving the context menu item", function(assert) {
		var bIsAvailable = true;
		sandbox.stub(this.oRenamePlugin, "isAvailable", function(oOverlay){
			assert.equal(oOverlay, this.oFormContainerOverlay, "the 'available' function calls isAvailable with the correct overlay");
			return bIsAvailable;
		}.bind(this));
		sandbox.stub(this.oRenamePlugin, "startEdit", function(oOverlay){
			assert.deepEqual(oOverlay, this.oFormContainerOverlay, "the 'startEdit' method is called with the right overlay");
		}.bind(this));
		sandbox.stub(this.oRenamePlugin, "isEnabled", function(oOverlay){
			assert.equal(oOverlay, this.oFormContainerOverlay, "the 'enabled' function calls isEnabled with the correct overlay");
		}.bind(this));

		var aMenuItems = this.oRenamePlugin.getMenuItems(this.oFormContainerOverlay);
		assert.equal(aMenuItems[0].id, "CTX_RENAME", "'getMenuItems' returns the context menu item for the plugin");

		aMenuItems[0].handler([this.oFormContainerOverlay]);
		aMenuItems[0].enabled(this.oFormContainerOverlay);

		bIsAvailable = false;
		assert.equal(this.oRenamePlugin.getMenuItems(this.oFormContainerOverlay).length,
			0,
			"and if plugin is not available for the overlay, no menu items are returned");
	});

	QUnit.test("when isAvailable and isEnabled are called without designTime", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({});
		this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
		this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

		assert.strictEqual(this.oRenamePlugin.isAvailable(this.oFormContainerOverlay), false, "then rename is not available for the overlay");
		assert.strictEqual(this.oRenamePlugin.isEnabled(this.oFormContainerOverlay), false, "then rename is not enabled for the overlay");
		assert.strictEqual(this.oRenamePlugin._isEditable(this.oFormContainerOverlay), false, "then rename is not editable for the overlay");
	});


	QUnit.module("Given a designTime and rename plugin are instantiated", {
		beforeEach : function(assert) {
			var done = assert.async();

			this.oRenamePlugin = new RenamePlugin({
				commandFactory : new CommandFactory()
			});

			this.oButton = new Button({text : "Button"});
			this.oLabel = new Label({text : "Label"});
			this.oVerticalLayout = new VerticalLayout({
				content : [this.oLabel, this.oButton],
				width: "200px"
			}).placeAt("content");
			sap.ui.getCore().applyChanges();

			this.oDesignTime = new DesignTime({
				rootElements : [this.oVerticalLayout],
				plugins : [this.oRenamePlugin],
				designTimeMetadata : {
					"sap.ui.layout.VerticalLayout" : {
						actions: {
							rename: {
								changeType: "renameField",
								domRef: function(oControl) {
									return this.oLabel.getDomRef();
								}.bind(this)
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				this.oLayoutOverlay = OverlayRegistry.getOverlay(this.oVerticalLayout);
				this.oButtonOverlay = OverlayRegistry.getOverlay(this.oButton);
				this.oLabelOverlay = OverlayRegistry.getOverlay(this.oLabel);
				this.oLayoutOverlay.setSelectable(true);

				sap.ui.getCore().applyChanges();

				done();
			}.bind(this));

		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the Label gets renamed", function(assert) {
		var fnDone = assert.async();
		sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
			if (mParams.overlay === this.oLayoutOverlay) {
				assert.equal(this.oLayoutOverlay.getSelected(), true, "then the overlay is still selected");
				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
				assert.equal(this.oLayoutOverlay.getSelected(), true, "then the overlay is still selected");
				fnDone();
			}
		}, this);
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
	});

	QUnit.test("when the Label gets renamed and the new value is extremely long", function(assert) {
		var fnDone = assert.async();
		sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
			if (mParams.overlay === this.oLayoutOverlay) {
				this.oRenamePlugin._$oEditableControlDomRef.text("123456789012345678901234567890123456789012345678901234567890");
				this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
				var $Event = jQuery.Event("keydown");
				$Event.keyCode = jQuery.sap.KeyCodes.ENTER;
				this.oRenamePlugin._$editableField.trigger($Event);
				sap.ui.getCore().applyChanges();
				assert.ok(this.oLabelOverlay.getParent().$()[0].className.indexOf("sapUiDtOverlayWithScrollBarHorizontal") === -1, "then the ScrollBar Horizontal Style Class was not set");
				fnDone();
			}
		}, this);
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
	});

	QUnit.test("when the title is not on the currently visible viewport and gets renamed", function(assert) {
		var $button = this.oButton.$();
		var $label = this.oLabel.$();
		$label.css("margin-bottom", document.documentElement.clientHeight);
		$button.get(0).scrollIntoView();
		var oScrollSpy = sinon.spy($label.get(0), "scrollIntoView");

		var fnDone = assert.async();
		sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
			if (mParams.overlay === this.oLayoutOverlay) {
				assert.equal(oScrollSpy.callCount, 1, "then the Label got scrolled");
				$label.get(0).scrollIntoView.restore();
				fnDone();
			}
		}, this);
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
	});

	QUnit.test("when the Label gets modified with DELETE key", function(assert) {
		var fnDone = assert.async();
		sap.ui.getCore().getEventBus().subscribeOnce('sap.ui.rta', 'plugin.Rename.startEdit', function (sChannel, sEvent, mParams) {
			if (mParams.overlay === this.oLayoutOverlay) {
				//Register event on Overlay (e.g. simulation event registration in Remove plugin)
				this.oLayoutOverlay.attachBrowserEvent("keydown", function () {
					throw new Error('This event should not be called!');
				});

				//Fire Keydown keyboard event on created by Rename plugin editable DOM-node.
				var $Event = jQuery.Event("keydown");
				$Event.keyCode = jQuery.sap.KeyCodes.DELETE;
				this.oRenamePlugin._$editableField.trigger($Event);

				//Waiting if any listeners above the field will throw an Error
				setTimeout(function () {
					assert.ok(true, "Delete test successful");
					fnDone();
				}, 50);

				this.oRenamePlugin.stopEdit(this.oLayoutOverlay);
			}
		}, this);
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
	});


	QUnit.module("Given a Rename plugin...", {
		beforeEach : function(){
			this.oRenamePlugin = new RenamePlugin({
				commandFactory : new CommandFactory()
			});
		},
		afterEach : function(){
			delete this.oRenamePlugin;
		}
	});

	QUnit.test('when the user tries to rename a field to empty string ("")', function(assert){
		this.oRenamePlugin._$editableField = {
			text : function(){
				return "";
			}
		};

		assert.strictEqual(RenameHandler._getCurrentEditableFieldText.call(this.oRenamePlugin), "\xa0", "then the empty string is replaced by a non-breaking space");
	});
});
