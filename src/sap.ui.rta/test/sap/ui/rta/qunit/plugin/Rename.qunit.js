/* global QUnit sinon */

QUnit.config.autostart = false;

jQuery.sap.require("sap.ui.qunit.qunit-coverage");
jQuery.sap.require("sap.ui.thirdparty.sinon");
jQuery.sap.require("sap.ui.thirdparty.sinon-ie");
jQuery.sap.require("sap.ui.thirdparty.sinon-qunit");

sap.ui.define([ "sap/ui/layout/VerticalLayout",
				"sap/ui/dt/DesignTime",
				"sap/ui/rta/command/CommandFactory",
				"sap/ui/dt/OverlayRegistry",
				"sap/ui/fl/registry/ChangeRegistry",
				"sap/ui/layout/form/FormContainer",
				"sap/ui/layout/form/Form",
				"sap/ui/layout/form/FormLayout",
				"sap/ui/rta/plugin/Rename",
				"sap/ui/core/Title",
				"sap/m/Button",
				"sap/m/Label" ],
	function(VerticalLayout, DesignTime, CommandFactory, OverlayRegistry, ChangeRegistry, FormContainer, Form, FormLayout, RenamePlugin, Title, Button, Label) {
	"use strict";

	QUnit.start();

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
				title: new Title({
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

		this.oRenamePlugin._onDesignTimeSelectionChange(oEvent);

		assert.strictEqual(aSelection, this.oRenamePlugin._aSelection, "then the arrays of selection are equal");
		assert.strictEqual(this.oRenamePlugin._aSelection.length, 1, "then the array of selection has only one selected overlay");
	});

	QUnit.test("when a title gets renamed", function(assert) {
		this.oRenamePlugin.startEdit(this.oFormContainerOverlay);
		assert.strictEqual(this.oFormContainerOverlay.getSelected(), true, "then the overlay is still selected");

		this.oRenamePlugin._stopEdit(this.oFormContainerOverlay);
		assert.strictEqual(this.oFormContainerOverlay.getSelected(), false, "then the overlay is not selected anymore");
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
		assert.strictEqual(this.oRenamePlugin.isRenameAvailable(this.oFormContainerOverlay), true, "then rename is available for the overlay");
	});

	QUnit.test("when isRenameAvailable and isRenameEnabled are called", function(assert) {
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

		assert.strictEqual(this.oRenamePlugin.isRenameAvailable(this.oFormContainerOverlay), true, "then rename is available for the overlay");
		assert.strictEqual(this.oRenamePlugin.isRenameEnabled(this.oFormContainerOverlay), true, "then rename is not enabled for the overlay");
		assert.strictEqual(this.oRenamePlugin._isEditable(this.oFormContainerOverlay), true, "then rename is editable for the overlay");
	});

	QUnit.test("when isRenameAvailable and isRenameEnabled are called without designTime", function(assert) {
		this.oFormContainerOverlay.setDesignTimeMetadata({});
		this.oRenamePlugin.deregisterElementOverlay(this.oFormContainerOverlay);
		this.oRenamePlugin.registerElementOverlay(this.oFormContainerOverlay);

		assert.strictEqual(this.oRenamePlugin.isRenameAvailable(this.oFormContainerOverlay), false, "then rename is not available for the overlay");
		assert.strictEqual(this.oRenamePlugin.isRenameEnabled(this.oFormContainerOverlay), false, "then rename is not enabled for the overlay");
		assert.strictEqual(this.oRenamePlugin._isEditable(this.oFormContainerOverlay), false, "then rename is not editable for the overlay");
	});

	QUnit.module("Given a designTime and rename plugin are instantiated", {
		beforeEach : function(assert) {
			var that = this;
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
									return that.oLabel.getDomRef();
								}
							}
						}
					}
				}
			});

			this.oDesignTime.attachEventOnce("synced", function() {
				that.oLayoutOverlay = OverlayRegistry.getOverlay(that.oVerticalLayout);
				that.oButtonOverlay = OverlayRegistry.getOverlay(that.oButton);
				that.oLabelOverlay = OverlayRegistry.getOverlay(that.oLabel);
				that.oLayoutOverlay.setSelectable(true);

				sap.ui.getCore().applyChanges();

				done();
			});

		},
		afterEach : function(assert) {
			this.oVerticalLayout.destroy();
			this.oDesignTime.destroy();
		}
	});

	QUnit.test("when the Label gets renamed", function(assert) {
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
		assert.equal(this.oLayoutOverlay.getSelected(), true, "then the overlay is still selected");

		this.oRenamePlugin._stopEdit(this.oLayoutOverlay);
		assert.equal(this.oLayoutOverlay.getSelected(), false, "then the overlay is not selected anymore");
	});

	QUnit.test("when the Label gets renamed and the new value is extremely long", function(assert) {
		this.oRenamePlugin.startEdit(this.oLayoutOverlay);
		this.oRenamePlugin._$oEditableControlDomRef.text("123456789012345678901234567890123456789012345678901234567890");
		this.oRenamePlugin._$editableField.text(this.oRenamePlugin._$oEditableControlDomRef.text());
		var $Event = jQuery.Event("keydown");
		$Event.keyCode = jQuery.sap.KeyCodes.ENTER;
		this.oRenamePlugin._$editableField.trigger($Event);
		sap.ui.getCore().applyChanges();
		assert.ok(this.oLabelOverlay.getParent().$()[0].className.indexOf("sapUiDtOverlayWithScrollBarHorizontal") === -1, "then the ScrollBar Horizontal Style Class was not set");
	});

	QUnit.test("when the Label gets modified with DELETE key", function(assert) {
		var done = assert.async();

		this.oRenamePlugin.startEdit(this.oLayoutOverlay);

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
			done();
		}, 50);

		this.oRenamePlugin._stopEdit(this.oLayoutOverlay);
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

		assert.strictEqual(this.oRenamePlugin._getCurrentEditableFieldText(), "\xa0", "then the empty string is replaced by a non-breaking space");
	});

});
