/* global QUnit */

sap.ui.define([
	"sap/ui/fl/write/api/FieldExtensibility",
	"sap/ui/rta/plugin/additionalElements/AddElementsDialog",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/core/Element",
	"sap/ui/core/Lib"
], function(
	FieldExtensibility,
	AddElementsDialog,
	sinon,
	Element,
	Lib
) {
	"use strict";

	var sandbox = sinon.createSandbox();
	var oTextResources = Lib.getResourceBundleFor("sap.ui.rta");

	function createDialog() {
		var aElements = [
			{
				selected: false,
				label: "label1",
				tooltip: "tooltip1",
				elementId: "field1",
				originalLabel: "original",
				type: "invisible"
			},
			{
				selected: true,
				label: "label2",
				tooltip: "tooltip2",
				name: "field2",
				type: "odata"
			},
			{
				selected: true,
				label: "label3",
				tooltip: "tooltip3",
				parentPropertyName: "complexPropName",
				name: "field3",
				type: "odata"
			},
			{
				selected: false,
				label: "label4",
				tooltip: "tooltip4",
				parentPropertyName: "duplicateComplexPropName",
				duplicateName: true,
				name: "field4",
				type: "odata"
			},
			{
				selected: false,
				label: "label5",
				tooltip: "tooltip5",
				name: "field5",
				type: "delegate"
			}
		];

		var oAddElementsDialog = new AddElementsDialog({
			title: "hugo"
		});

		oAddElementsDialog.setElements(aElements);
		return oAddElementsDialog;
	}

	QUnit.module("Given that a AddElementsDialog is available...", {
		beforeEach() {
			this.oAddElementsDialog = createDialog();
		},
		afterEach() {
			this.oAddElementsDialog.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when item is selected, focus should persist", function(assert) {
			var done = assert.async();

			function getItemByPath(aItems, sBindingPath) {
				return aItems.filter(function(oItem) {
					return oItem.getBindingContext().getPath() === sBindingPath;
				})[0];
			}

			this.oAddElementsDialog._oDialogPromise.then(function() {
				const oList = Element.getElementById(`${this.oAddElementsDialog.getId()}--rta_addElementsDialogList`);
				var sBindingPath = oList.getItems()[0].getBindingContext().getPath();

				function checkList() {
					var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
					assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
					done();
				}

				this.oAddElementsDialog.attachOpened(function() {
					var oTargetItem = getItemByPath(oList.getItems(), sBindingPath);
					oTargetItem.getDomRef().focus();
					assert.strictEqual(document.activeElement, oTargetItem.getDomRef());
					oTargetItem.getDomRef().dispatchEvent(new Event("touchstart"));

					// Wait until list is re-rendered
					setTimeout(checkList);
				});
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized and open is called,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.ok(true, "then dialog pops up,");
				assert.equal(this.getTitle(), "hugo", "then the title is set");
				assert.equal(this._oList.getItems().length, 5, "then 5 elements internally known");
				assert.equal(this.getElements().length, 5, "then 5 elements externally known");
				assert.equal(this.getSelectedElements().length, 2, "then 2 selected elements");
				assert.equal(this.getCustomFieldButtonVisible(), false, "then the customField-button is hidden");
				assert.equal(
					this._oList.getItems()[0].getContent()[0].getItems()[1].getText(),
					"was original",
					"then the originalLabel is set"
				);
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldButtonVisible set and no Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			this.oAddElementsDialog.attachOpened(function() {
				const oBCContainer = Element.getElementById(`${this.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 2, "and the Business Context Container has two entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					oTextResources.getText("MSG_NO_BUSINESS_CONTEXTS"),
					"and the second entry is the No-Context Message"
				);
				done();
			});
			this.oAddElementsDialog._oDialogPromise
			.then(function() {
				this.oAddElementsDialog.addExtensibilityInfo({
					UITexts: {
						headerText: "extensibilityHeaderText",
						tooltip: "extensibilityTooltip"
					}
				});
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized with customFieldButtonVisible set and three Business Contexts are available", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			this.oAddElementsDialog.attachOpened(function() {
				const oBCContainer = Element.getElementById(`${this.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					"Business Context 1",
					"and the second entry is the First Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[2].getText(),
					"Business Context 2",
					"and the third entry is the Second Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[3].getText(),
					"Business Context 3",
					"and the fourth entry is the Third Business Context"
				);
				done();
			});
			var oExtensibilityInfo = {
				extensionData: [
					{description: "Business Context 1"},
					{description: "Business Context 2"},
					{description: "Business Context 3"}
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip"
				}
			};
			this.oAddElementsDialog._oDialogPromise
			.then(function() {
				this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets closed and opened again with customFieldButtonVisible set and available Business Contexts", function(assert) {
			var done = assert.async();

			function fnOnClose() {
				this.oAddElementsDialog.attachEventOnce("opened", fnOnOpen);
			}
			function fnOnOpen() {
				const oBCContainer = Element.getElementById(`${this.getId()}--rta_businessContextContainer`);
				assert.ok(oBCContainer.getVisible(), "then the Business Context Container is visible");
				assert.equal(oBCContainer.getContent().length, 4, "and the Business Context Container has four entries");
				assert.equal(oBCContainer.getContent()[0].getText(), "extensibilityHeaderText", "and the first entry is the Title");
				assert.equal(
					oBCContainer.getContent()[1].getText(),
					"Business Context 1",
					"and the second entry is the First Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[2].getText(),
					"Business Context 2",
					"and the third entry is the Second Business Context"
				);
				assert.equal(
					oBCContainer.getContent()[3].getText(),
					"Business Context 3",
					"and the fourth entry is the Third Business Context"
				);
				done();
			}

			this.oAddElementsDialog.setCustomFieldButtonVisible(true);
			var oExtensibilityInfo = {
				extensionData: [
					{description: "Business Context 1"},
					{description: "Business Context 2"},
					{description: "Business Context 3"}
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip"
				}
			};
			this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
			this.oAddElementsDialog._oDialogPromise.then(function(oDialog) {
				oDialog.attachEventOnce("afterClose", fnOnClose, this);
			}.bind(this));

			// Open the first time and close it
			this.oAddElementsDialog.open();
			this.oAddElementsDialog._submitDialog();

			// Add Business Context again
			this.oAddElementsDialog.addExtensibilityInfo(oExtensibilityInfo);
			// Open the second time
			this.oAddElementsDialog.open();
		});

		QUnit.test("when AddElementsDialog gets initialized with legacy extensibility", function(assert) {
			const done = assert.async();
			const oButtonText = oTextResources.getText("BTN_ADDITIONAL_ELEMENTS_CREATE_CUSTOM_FIELDS");
			const oExtensibilityInfo = {
				extensionData: [
					{description: "Business Context 1"}
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					options: [
						{
							tooltip: "extensibilityTooltip",
							text: oButtonText
						}]
				}
			};
			this.oAddElementsDialog.attachOpened(function() {
				const oButton = Element.getElementById(`${this.getId()}--rta_customFieldButton`);
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oButton.getVisible(), true, "then Button is visible");
				assert.strictEqual(
					oButton.getText(),
					oButtonText,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oButton.getTooltip(),
					oExtensibilityInfo.UITexts.tooltip,
					"then the tooltip text is set correctly"
				);
				oButton.attachPress(() => {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(undefined),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				});
				oButton.firePress();
			});
			this.oAddElementsDialog._oDialogPromise
			.then(function() {
				this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized with one extensibility option", function(assert) {
			var done = assert.async();
			var oExtensibilityInfo = {
				extensionData: [
					{description: "Business Context 1"}
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					buttonText: "Add Custom",
					options: [
						{
							actionKey: "key1",
							text: "Add Custom Field",
							tooltip: "tooltip1"
						}
					]
				}
			};
			this.oAddElementsDialog.attachOpened(function() {
				const oButton = Element.getElementById(`${this.getId()}--rta_customFieldButton`);
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oButton.getVisible(), true, "then Button is visible");
				assert.strictEqual(
					oButton.getText(),
					oExtensibilityInfo.UITexts.options[0].text,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oButton.getTooltip(),
					oExtensibilityInfo.UITexts.options[0].tooltip,
					"then the tooltip text is set correctly"
				);
				oButton.attachPress(() => {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[0].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				});
				oButton.firePress();
			});

			this.oAddElementsDialog._oDialogPromise
			.then(function() {
				this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when AddElementsDialog gets initialized with multiple extensibility options", function(assert) {
			var done = assert.async(2);
			var oExtensibilityInfo = {
				extensionData: [
					{description: "Business Context 1"}
				],
				UITexts: {
					headerText: "extensibilityHeaderText",
					tooltip: "extensibilityTooltip",
					buttonText: "Add Custom",
					options: [
						{
							actionKey: "key1",
							text: "Add Custom Field",
							tooltip: "tooltip1"
						},
						{
							actionKey: "key2",
							text: "Add Custom Logic",
							tooltip: "tooltip2"
						}
					]
				}
			};
			this.oAddElementsDialog.attachOpened(function() {
				const oMenuButton = Element.getElementById(`${this.getId()}--rta_customFieldMenuButton`);
				const aMenuItems = oMenuButton.getMenu().getItems();
				const oRedirectToCustomFieldCreationStub = sandbox.stub(AddElementsDialog.prototype, "_redirectToExtensibilityAction");
				assert.strictEqual(oMenuButton.getVisible(), true, "then MenuButton is visible");
				assert.strictEqual(
					oMenuButton.getText(),
					oExtensibilityInfo.UITexts.buttonText,
					"then the button text is set correctly"
				);
				assert.strictEqual(
					oMenuButton.getTooltip(),
					oExtensibilityInfo.UITexts.tooltip,
					"then the tooltip text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[0].getText(),
					oExtensibilityInfo.UITexts.options[0].text,
					"then the first menu item text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[0].getTooltip(),
					oExtensibilityInfo.UITexts.options[0].tooltip,
					"then the first menu item tooltip text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[1].getText(),
					oExtensibilityInfo.UITexts.options[1].text,
					"then the second menu item text is set correctly"
				);
				assert.strictEqual(
					aMenuItems[1].getTooltip(),
					oExtensibilityInfo.UITexts.options[1].tooltip,
					"then the second menu item tooltip text is set correctly"
				);
				aMenuItems[0].attachPress(() => {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledOnce,
						true,
						"then the _redirectToExtensibilityAction method is called once"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[0].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				});
				aMenuItems[1].attachPress(() => {
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledTwice,
						true,
						"then the _redirectToExtensibilityAction method is called twice"
					);
					assert.strictEqual(
						oRedirectToCustomFieldCreationStub.calledWith(oExtensibilityInfo.UITexts.options[1].actionKey),
						true,
						"then the _redirectToExtensibilityAction method is called with the correct parameters"
					);
					done();
				});
				aMenuItems[0].firePress();
				aMenuItems[1].firePress();
			});

			this.oAddElementsDialog._oDialogPromise
			.then(function() {
				this.oAddElementsDialog.setExtensibilityOptions(oExtensibilityInfo);
				this.oAddElementsDialog.open();
			}.bind(this));
		});

		QUnit.test("when on opened AddElementsDialog OK is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._submitDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(true, "then the promise got resolved");
			});
		});

		QUnit.test("when on opened AddElementsDialog Cancel is pressed,", function(assert) {
			this.oAddElementsDialog.attachOpened(function() {
				this._cancelDialog();
			});

			return this.oAddElementsDialog.open().then(function() {
				assert.ok(false, "then the promise got rejected");
			}).catch(function() {
				assert.ok(true, "then the promise got rejected");
			});
		});

		QUnit.test("when on opened AddElementsDialog the list gets filtered via input", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems().length, 5, "then initially 5 entries are there");
				this._updateModelFilter({getParameter() {return "2";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for '2' then 1 entry is shown");
				this._updateModelFilter({getParameter() {return null;}});
				assert.equal(this._oList.getItems().length, 5, "then after clearing 5 entries are there");
				this._updateModelFilter({getParameter() {return "complex";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'complex' then 1 entry is shown");
				assert.equal(
					this._oList.getItems()[0].getContent()[0].getItems()[0].getText(),
					"label4 (duplicateComplexPropName)",
					"then only label4 where complex is part of the label (duplicateName)"
				);
				this._updateModelFilter({getParameter() {return null;}});
				this._updateModelFilter({getParameter() {return "orig";}});
				assert.equal(this._oList.getItems().length, 1, "when filtering for 'orig' then 1 entry is shown");
				assert.equal(
					this._oList.getItems()[0].getContent()[0].getItems()[0].getText(),
					"label1",
					"then only label1 with original name"
				);
				done();
			});
			this.oAddElementsDialog.open();
		});

		QUnit.test("when on opened AddElementsDialog the resort-button is pressed,", function(assert) {
			var done = assert.async();

			this.oAddElementsDialog.attachOpened(function() {
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label1", "then label1 is first");
				this._resortList();
				assert.equal(this._oList.getItems()[0].getContent()[0].getItems()[0].getText(), "label5", "then last label is first");
				done();
			});
			this.oAddElementsDialog.open();
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});