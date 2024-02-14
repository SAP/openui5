/*global QUnit, sinon */
sap.ui.define([
	'sap/ui/test/RecordReplay',
	'sap/ui/test/autowaiter/_autoWaiter',
	'sap/ui/test/autowaiter/_autoWaiterAsync',
	'sap/ui/core/ListItem',
	'sap/m/Button',
	'sap/m/Input',
	'sap/m/MultiInput',
	'sap/m/OverflowToolbar',
	'sap/m/Popover',
	'sap/m/SearchField',
	"sap/ui/thirdparty/jquery",
	'sap/m/App',
	'sap/ui/core/mvc/XMLView',
	"sap/ui/qunit/utils/nextUIUpdate"
], function (RecordReplay, _autoWaiter, _autoWaiterAsync, ListItem, Button, Input, MultiInput, OverflowToolbar, Popover, SearchField, $, App, XMLView, nextUIUpdate) {
	"use strict";

	QUnit.module("RecordReplay - control selector", {
		beforeEach: function (assert) {
			// Note: This test is executed with QUnit 1 and QUnit 2.
			//       We therefore cannot rely on the built-in promise handling of QUnit 2.
			return XMLView.create({
				id: "myView",
				definition:
					'<mvc:View xmlns:core="sap.ui.core" xmlns:mvc="sap.ui.core.mvc" xmlns="sap.m">' +
					'  <App id="myApp">' +
					'    <Page id="page1">' +
					'      <SearchField id="mySearch" placeholder="Test"/>' +
					'      <SearchField placeholder="Placeholder"/>' +
					'    </Page>' +
					'  </App>' +
					'</mvc:View>'
			}).then(function(oView) {
				this.oView = oView.placeAt("qunit-fixture");
				return nextUIUpdate();
			}.bind(this), function(oErr) {
				assert.strictEqual(oErr, undefined, "failed to load view");
			});
		},
		afterEach: function () {
			this.oView.destroy();
		}
	});

	QUnit.test("Should generate selector for DOM element", function (assert) {
		var fnDone = assert.async();
		RecordReplay.findControlSelectorByDOMElement({
			domElement: $("#myView--mySearch")[0]
		}).then(function (mSelector) {
			assert.strictEqual(mSelector.id, "myView--mySearch", "Should generate a selector");
			assert.ok(!mSelector.interaction, "Should not include interaction suffix");
		}).finally(fnDone);
	});

	QUnit.test("Should generate selector for DOM element with interaction ID suffix", function (assert) {
		var fnDone = assert.async();
		RecordReplay.findControlSelectorByDOMElement({
			domElement: $("#myView--mySearch-reset")[0]
		}).then(function (mSelector) {
			assert.strictEqual(mSelector.id, "myView--mySearch", "Should generate a selector");
			assert.strictEqual(mSelector.interaction.idSuffix, "reset", "Should generate a selector with interaction DOM ID suffix");
		}).finally(fnDone);
	});

	QUnit.module("RecordReplay - DOM element search", {
		beforeEach: function () {
			this.oSearchField = new SearchField("mySearch", {placeholder: "Test"});
			this.oSearchFieldMulti = new SearchField("mySecondSearch", {placeholder: "Multi"});
			this.oSearchField.placeAt("qunit-fixture");
			this.oSearchFieldMulti.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oSearchField.destroy();
			this.oSearchFieldMulti.destroy();
		}
	});

	QUnit.test("Should find DOM element by control selector", function (assert) {
		var fnDone = assert.async();
		Promise.all([RecordReplay.findDOMElementByControlSelector({
			selector: {
				controlType: "sap.m.SearchField",
				propertyStrictEquals: {name: "placeholder", value: "Test"}
			}
		}), RecordReplay.findDOMElementByControlSelector({
			selector: {
				controlType: "sap.m.SearchField",
				propertyStrictEquals: {name: "placeholder", value: "Test"},
				interaction: "focus"
			}
		})]).then(function (aDOMElements) {
			assert.equal(aDOMElements[0], $("#mySearch-search")[0], "Should find the search field button");
			assert.equal(aDOMElements[1], $("#mySearch input")[0], "Should find the search field input");
		}).finally(fnDone);
	});

	QUnit.test("Should find multiple DOM element by control selector", function (assert) {
		var fnDone = assert.async();
		return RecordReplay.findAllDOMElementsByControlSelector({
			selector: {
				controlType: "sap.m.SearchField"
			}
		}).then(function (aDOMElements) {
			assert.strictEqual(aDOMElements.length, 2, "Should find all search buttons");
			assert.equal(aDOMElements[0], $("#mySearch-search")[0]);
			assert.equal(aDOMElements[1], $("#mySecondSearch-search")[0]);

			return RecordReplay.findAllDOMElementsByControlSelector({
				selector: {
					controlType: "sap.m.SearchField",
					interaction: "focus"
				}
			});
		}).then(function (aDOMElements) {
			assert.strictEqual(aDOMElements.length, 2, "Should find all search inputs");
			assert.equal(aDOMElements[0], $("#mySearch input")[0]);
			assert.equal(aDOMElements[1], $("#mySecondSearch input")[0]);
		}).finally(fnDone);
	});

	QUnit.test("Should reject if no DOM element is found by a control selector - single", function (assert) {
		assert.expect(2);
		var fnDone = assert.async();
		return RecordReplay.findDOMElementByControlSelector({
			selector: {
				controlType: "sap.m.App"
			}
		}).catch(function (oError) {
			assert.ok(oError.toString().match(/No DOM element found/), "Should reject when no DOM element matches the selector");
			this.oSearchField.destroy();
			this.oSearchFieldMulti.destroy();
			return RecordReplay.findDOMElementByControlSelector({
				selector: {
					controlType: "sap.m.SearchField"
				}
			}).catch(function (oError) {
				assert.ok(oError.toString().match(/No DOM element found/), "Should reject when an error occurs while searching for DOM element");
			});
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should resolve with empty array if no DOM elements are found - multi", function (assert) {
		assert.expect(2);
		var fnDone = assert.async();
		return RecordReplay.findAllDOMElementsByControlSelector({
			selector: {
				controlType: "sap.m.App"
			}
		}).then(function (aDOMElements) {
			assert.ok(!aDOMElements.length, "Should return no elements when none match the selector");
			this.oSearchField.destroy();
			this.oSearchFieldMulti.destroy();
			return RecordReplay.findDOMElementByControlSelector({
				selector: {
					controlType: "sap.m.SearchField"
				}
			}).catch(function (oError) {
				assert.ok(oError.toString().match(/No DOM element found/), "Should reject when an error occurs while searching for DOM element");
			});
		}.bind(this)).finally(fnDone);
	});

	QUnit.module("RecordReplay - Interaction", {
		beforeEach: function () {
			this.oActionSpy = sinon.spy();
			this.mSearchFieldSelector = {
				controlType: "sap.m.SearchField"
			};
			this.oSearchField = new SearchField();
			this.oSearchField.attachSearch(this.oActionSpy);
			this.oSearchField.placeAt("qunit-fixture");
			return nextUIUpdate();
		},
		afterEach: function () {
			this.oSearchField.destroy();
		}
	});

	QUnit.test("Should press on a control", function (assert) {
		var fnDone = assert.async();
		RecordReplay.interactWithControl({
			selector: this.mSearchFieldSelector,
			interactionType: RecordReplay.InteractionType.Press
		}).then(function () {
			assert.ok(this.oActionSpy.called, "Should press the search button");
		}.bind(this)).finally(fnDone);
	});

	QUnit.test("Should enter text in control", function (assert) {
		var fnDone = assert.async();
		this.oSearchField.setShowSearchButton(false);
		RecordReplay.interactWithControl({
			selector: this.mSearchFieldSelector,
			interactionType: RecordReplay.InteractionType.EnterText,
			enterText: "Test"
		}).then(function () {
			assert.ok(this.oActionSpy.called, "Should enter search text");
			assert.strictEqual(this.oSearchField.getValue(), "Test", "Should enter search text");
		}.bind(this)).finally(function () {
			this.oSearchField.setShowSearchButton(true);
			fnDone();
		}.bind(this));
	});

	QUnit.test("Should open Suggestions Popover through EnterText Action on MultiInput", async function (assert) {
		var fnDone = assert.async(),
			oMultiInput = new MultiInput({
				value: "",
				showSuggestion: true,
				showValueHelp: false,
				suggestionItems: [
					new ListItem({text: "Item 1"}),
					new ListItem({text: "Item 2"})
				]
			}),
			oPopover = oMultiInput._getSuggestionsPopover().getPopover();

		oPopover.attachAfterOpen(function () {
			assert.ok(true, "Suggest list is shown");
			assert.strictEqual(oMultiInput.getValue(), "Item", "Should enter search text");

			oMultiInput.destroy();
			fnDone();
		});
		oMultiInput.placeAt("qunit-fixture");
		await nextUIUpdate();

		RecordReplay.interactWithControl({
			selector: {controlType: "sap.m.MultiInput"},
			interactionType: RecordReplay.InteractionType.EnterText,
			enterText: "Item",
			keepFocus: true
		});
	});

	QUnit.test("Should enter text in Popover - Popover should remain open", async function (assert) {
		var fnDone = assert.async(),
			oButton = new Button({
				id: "open"
			}),
			oInput1 = new Input({
				id: "test1"
			}),
			oInput2 = new Input({
				id: "test2"
			}),
			oPopover = new Popover({
				content: [
					oInput1,
					oInput2
				]
			});

		oButton.placeAt("qunit-fixture");
		await nextUIUpdate();

		oPopover.openBy(oButton);
		oPopover.$().css("display", "block");

		oInput1.attachEvent("change", function () {
			assert.strictEqual(oInput1.getValue(), "value");
			assert.ok(oPopover.isOpen());

			setTimeout(function () {
				oInput2.attachEvent("change", function () {
					assert.strictEqual(oInput2.getValue(), "value");
					assert.ok(oPopover.isOpen());

					setTimeout(function () {
						oButton.destroy();
						oPopover.destroy();
						fnDone();
					}, 100);
				});

				RecordReplay.interactWithControl({
					selector: {id: "test2"},
					interactionType: RecordReplay.InteractionType.EnterText,
					enterText: "value",
					pressEnterKey: true
				});
			}, 100);
		});

		RecordReplay.interactWithControl({
			selector: {id: "test1"},
			interactionType: RecordReplay.InteractionType.EnterText,
			enterText: "value",
			pressEnterKey: true
		});
	});

	QUnit.test("Should interact with Control with provided idSuffix", async function (assert) {
		var fnDone = assert.async(),
			oOFT = new OverflowToolbar({
				content: [
					new Button({text: "Button 1", width: "100%"}),
					new Button({text: "Button 2"})
				]
			}),
			oPopover = oOFT._getPopover();

		oOFT.placeAt("qunit-fixture");
		await nextUIUpdate();

		oPopover.attachAfterOpen(function () {
			assert.ok(true, "Overflow button of OverflowToolbar is pressed");

			oOFT.destroy();
			fnDone();
		});

		RecordReplay.interactWithControl({
			selector: {
				controlType: "sap.m.OverflowToolbar",
				interaction: {
					idSuffix: "overflowButton"
				}
			},
			interactionType: RecordReplay.InteractionType.Press
		});
	});

	QUnit.test("Should complain when interaction is not supported", function (assert) {
		var fnDone = assert.async();
		RecordReplay.interactWithControl({
			selector: this.mSearchFieldSelector,
			interactionType: "SomeOtherType"
		}).catch(function (oError) {
			assert.ok(oError.toString().match(/Unsupported interaction type/), "Should reject when interaction is not supported");
		}).finally(fnDone);
	});

	QUnit.test("Should fail if control selector does not match any control", function (assert) {
		var fnDone = assert.async();
		this.oSearchField.destroy();
		RecordReplay.interactWithControl({
			selector: {},
			interactionType: RecordReplay.InteractionType.Press
		}).catch(function (oError) {
			assert.ok(oError.toString().match(/No controls found using selector/), "Should reject when control selector matches no controls");
		}).finally(fnDone);
	});

	QUnit.module("RecordReplay - AutoWait", {
		beforeEach: function () {
			this.clock = sinon.useFakeTimers();
			this.fnWaitAsyncSpy = sinon.spy(_autoWaiterAsync, "waitAsync");
			this.fnConfigAsyncWaiterSpy = sinon.spy(_autoWaiterAsync, "extendConfig");
			this.fnConfigWaiterSpy = sinon.spy(_autoWaiter, "extendConfig");
			this.fnHasToWaitStub = sinon.stub(_autoWaiter, "hasToWait");
		},
		afterEach: function () {
			this.clock.restore();
			this.fnWaitAsyncSpy.restore();
			this.fnConfigAsyncWaiterSpy.restore();
			this.fnConfigWaiterSpy.restore();
			this.fnHasToWaitStub.restore();
		}
	});

	QUnit.test("Should wait for UI5 processing to complete", function (assert) {
		var fnDone = assert.async();
		this.fnHasToWaitStub.onFirstCall().returns(true);
		this.fnHasToWaitStub.returns(false);
		RecordReplay.waitForUI5({timeout: 10000, interval: 100}).then(function () {
			assert.ok(this.fnHasToWaitStub.called, "Should call autoWaiter");
			assert.ok(!_autoWaiter.hasToWait(), "Should wait for processing to end");
			assert.ok(this.fnConfigAsyncWaiterSpy.calledOnce, "Should configure polling parameters");
			assert.ok(this.fnWaitAsyncSpy.calledOnce, "Should poll for autoWaiter conditions to be met");
		}.bind(this)).catch(function (error) {
			assert.ok(false, "Should not reach here" + error);
		}).finally(function () {
			fnDone();
		});

		this.clock.tick(200);
	});

	QUnit.test("Should timeout when UI5 processing is not complete", function (assert) {
		var fnDone = assert.async();
		this.fnHasToWaitStub.returns(true);
		RecordReplay.waitForUI5({timeout: 100, interval: 100}).then(function () {
			assert.ok(false, "Should not reach here");
		}).catch(function (oError) {
			assert.ok(this.fnHasToWaitStub.called, "Should call autoWaiter");
			assert.ok(_autoWaiter.hasToWait(), "Should have pending processing");
			assert.ok(oError.toString().match(/Polling stopped.*there is still pending asynchronous work/), "Should receive polling error message");
		}.bind(this)).finally(function () {
			fnDone();
		});

		this.clock.tick(200);
	});

	QUnit.test("Should apply default values when parameters values ommited", function (assert) {
		RecordReplay.waitForUI5({timeout: 10000, interval: 100});
		assert.ok(this.fnConfigWaiterSpy.calledWithMatch({timeout: 10000, interval: 100}), "the custom values are applied");
		RecordReplay.waitForUI5().catch(function() {}); // ignore error for calling waitForUI5 twice sychronously
		assert.ok(this.fnConfigWaiterSpy.calledWithMatch({timeout: 15000, interval: 400}), "the default values are applied");
	});
});
