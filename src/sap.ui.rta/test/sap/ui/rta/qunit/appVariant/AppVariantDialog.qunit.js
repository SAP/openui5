/* global QUnit */

sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Element"
], function(
	AppVariantDialog,
	sinon,
	Element
) {
	"use strict";

	var oAppVariantDialog;
	var sandbox = sinon.createSandbox();

	QUnit.module("Given that a AppVariantDialog is instantiated", {
		beforeEach() {
			oAppVariantDialog = new AppVariantDialog();
		},
		afterEach() {
			oAppVariantDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("When open is called,", function(assert) {
			oAppVariantDialog.open();
			assert.ok("then the app variant dialog is opened");
		});

		QUnit.test("When cancel button is pressed on AppVariant Dialog", function(assert) {
			var bPressed = false;
			var fPressed = function() {
				bPressed = true;
			};
			var aButtons = oAppVariantDialog.getButtons();
			oAppVariantDialog.attachCancel(fPressed);
			aButtons[1].firePress();
			assert.equal(bPressed, true);
		});

		QUnit.test("When save button is pressed on AppVariant Dialog", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var aButtons = oAppVariantDialog.getButtons();

			oAppVariantDialog.attachCreate(function(oAppVariantData) {
				var mParams = oAppVariantData.getParameters();
				assert.equal(mParams.title, " ", "then the title is correct");
				assert.equal(mParams.subTitle, " ", "then the subtitle is correct");
				assert.equal(mParams.icon, " ", "then the icon is correct");
				assert.equal(mParams.description, " ", "then the decription is correct");
				done();
			});
			aButtons[0].firePress();
		});

		QUnit.test("When liveChange event is triggered on a title Input field with empty value", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var oTitleInput = Element.getElementById("titleInput");

			oTitleInput.attachLiveChange(function() {
				assert.equal(oAppVariantDialog.getButtons()[0].getEnabled(), false, "then the save button is not enabled");
				done();
			});

			oTitleInput.fireLiveChange();
		});

		QUnit.test("When liveChange event is triggered on a title Input field with non empty value", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var oTitleInput = Element.getElementById("titleInput");

			oTitleInput.attachLiveChange(function() {
				assert.equal(oAppVariantDialog.getButtons()[0].getEnabled(), true, "then the save button is not enabled");
				done();
			});

			oTitleInput.setValue("TestTitle");

			oTitleInput.fireLiveChange();
		});

		QUnit.test("When valueHelpRequest event is triggered on an Input field and then search event is triggered on SelectDialog", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var oSelectInput = Element.getElementById("selectInput");

			oSelectInput.attachValueHelpRequest(function() {
				var oSelectDialog = Element.getElementById("selectDialog");
				assert.ok("then the select dialog gets opened");
				assert.ok(oSelectDialog.getDomRef(), "then the control got rendered");
				assert.strictEqual(oSelectDialog.getBindingPath("items"), "/icons", "then the select dialog gets bound with a correct model property");

				const fnOnSearch = function() {
					oSelectDialog.detachSearch(fnOnSearch);
					assert.equal(this.getItems().length, 1, "then the search works correctly");
					var sIconName = this.getItems()[0].getIcon();
					assert.strictEqual(sIconName, "sap-icon://wrench", "then the icon is correct");
					done();
				};

				oSelectDialog.attachSearch(fnOnSearch);
				oSelectDialog.fireSearch({value: "wrench"});
			});

			oSelectInput.fireValueHelpRequest();
		});

		QUnit.test("When valueHelpRequest event is triggered on an Input field and then search event is triggered on SelectDialog with icon text different to icon name", function(assert) {
			const done = assert.async();
			oAppVariantDialog.open();
			const oSelectInput = Element.getElementById("selectInput");

			oSelectInput.attachValueHelpRequest(function() {
				const oSelectDialog = Element.getElementById("selectDialog");
				assert.ok("then the select dialog gets opened");
				assert.ok(oSelectDialog.getDomRef(), "then the control got rendered");
				assert.strictEqual(oSelectDialog.getBindingPath("items"), "/icons", "then the select dialog gets bound with a correct model property");

				const fnOnSearch = function() {
					oSelectDialog.detachSearch(fnOnSearch);
					assert.equal(this.getItems().length, 1, "then the search works correctly");
					const sIconName = this.getItems()[0].getIcon();
					assert.strictEqual(sIconName, "sap-icon://add-filter", "then the icon is correct");
					setTimeout(function() {
						oSelectDialog.fireConfirm({
							selectedItem: this.getItems()[0],
							selectedContexts: [this.getItems()[0].getBindingContext()]
						});
					}.bind(this), 100);
				};

				const fnOnConfirm = function(oEvent) {
					oSelectDialog.detachConfirm(fnOnConfirm);
					const aContexts = oEvent.getParameter("selectedContexts");
					assert.strictEqual(aContexts.length, 1, "then the selected contexts are available");
					const sIconName = aContexts[0].getObject().name;
					assert.strictEqual(sIconName, "add-filter", "then the selected icon name is correct");
					done();
				};

				oSelectDialog.attachSearch(fnOnSearch);
				oSelectDialog.attachConfirm(fnOnConfirm);
				oSelectDialog.fireSearch({value: "add filter"});
			});

			oSelectInput.fireValueHelpRequest();
		});

		QUnit.test("When liveChange event is triggered on an Input field", function(assert) {
			oAppVariantDialog.open();
			var oSelectInput = Element.getElementById("selectInput");

			var bEventTriggered = false;

			var fEventTriggered = function() {
				bEventTriggered = true;
			};
			oSelectInput.attachLiveChange(fEventTriggered);

			oSelectInput.fireLiveChange();
			assert.equal(bEventTriggered, true, "then the live change event was triggered");
		});

		QUnit.test("When confirm event is triggered on SelectDialog", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var oSelectInput = Element.getElementById("selectInput");

			oSelectInput.attachValueHelpRequest(function() {
				var oSelectDialog = Element.getElementById("selectDialog");
				assert.ok("then the select dialog gets opened");
				assert.ok(oSelectDialog.getDomRef(), "then the control got rendered");
				assert.strictEqual(oSelectDialog.getBindingPath("items"), "/icons", "then the select dialog gets bound with a correct model property");

				var bConfirmPressed = false;

				var fConfirmPressed = function() {
					bConfirmPressed = true;
				};

				oSelectDialog.attachConfirm(fConfirmPressed);

				oSelectDialog.fireConfirm();
				assert.equal(bConfirmPressed, true, "then the confirm button was pressed");
				done();
			});

			oSelectInput.fireValueHelpRequest();
		});

		QUnit.test("When cancel event is triggered on SelectDialog", function(assert) {
			var done = assert.async();
			oAppVariantDialog.open();
			var oSelectInput = Element.getElementById("selectInput");

			oSelectInput.attachValueHelpRequest(function() {
				var oSelectDialog = Element.getElementById("selectDialog");
				assert.ok("then the select dialog gets opened");
				assert.ok(oSelectDialog.getDomRef(), "then the control got rendered");
				assert.strictEqual(oSelectDialog.getBindingPath("items"), "/icons", "then the select dialog gets bound with a correct model property");

				var bCancelPressed = false;

				var fCancelPressed = function() {
					bCancelPressed = true;
				};
				oSelectDialog.attachCancel(fCancelPressed);

				oSelectDialog.fireCancel();
				assert.equal(bCancelPressed, true, "then the cancel button was pressed");
				oSelectDialog.destroy();
				done();
			});

			oSelectInput.fireValueHelpRequest();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});