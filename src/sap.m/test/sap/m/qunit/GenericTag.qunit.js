/*global QUnit, sinon */
sap.ui.define([
	"sap/m/GenericTag",
	"sap/m/GenericTagRenderer",
	"sap/m/library",
	"sap/m/ObjectNumber",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/ToolbarSpacer",
	"sap/m/OverflowToolbar"
], function(GenericTag, GenericTagRenderer, library, ObjectNumber, coreLibrary, KeyCodes, qutils, ToolbarSpacer, OverflowToolbar) {
	"use strict";

	var GenericTagDesign = library.GenericTagDesign,
		GenericTagValueState = library.GenericTagValueState,
		ValueState = coreLibrary.ValueState,
		oCore = sap.ui.getCore(),
		TESTS_DOM_CONTAINER = "qunit-fixture",
		GENERICTAG_TEXT_ID_SUFFIX = "-text",
		GENERICTAG_STATUSTEXT_ID_SUFFIX = "-status";

	/* --------------------------- GenericTag API ---------------------------------- */
	QUnit.module("Default properties values", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag();
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
		}
	});

	QUnit.test("Default value of design", function(assert) {
		assert.strictEqual(this.oGenericTag.getProperty("design"), GenericTagDesign.Full,
			"The default value for the 'design' property is 'GenericTagDesign.Full'.");
	});

	QUnit.test("Default value of status", function(assert) {
		assert.strictEqual(this.oGenericTag.getProperty("status"), ValueState.None,
			"The default value for the 'status' property is 'ValueState.None'.");
	});

	QUnit.test("Default value of valueState", function(assert) {
		assert.strictEqual(this.oGenericTag.getProperty("valueState"), GenericTagValueState.None,
		"The default value for the 'valueState' property is 'GenericTagValueState.None'.");
	});

	QUnit.test("Default value of text", function(assert) {
		assert.strictEqual(this.oGenericTag.getProperty("text"), "",
			"The default value for the 'text' property is empty string.");
	});

	QUnit.test("_getStatusIcon should return the _statusIcon with empty src property", function(assert) {
			//act
			var oStatusIcon = this.oGenericTag._getStatusIcon();

			//assert
			assert.strictEqual(oStatusIcon.getSrc(), "", "Status icon's src property should be an empty string");
	});

	QUnit.module("GenericTag - setStatus", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag({
				status: ValueState.Success
			}).placeAt(TESTS_DOM_CONTAINER);
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
		}
	});

	QUnit.test("GenericTag - setStatus should set the correct status icon src", function(assert) {
		var sStatusIconNamePrefix = "sap-icon://message-",
			sInformationIconSrc = "sap-icon://hint";

		for (var sValueState in ValueState) {
			var sActualIconSrc;

			if (sValueState === ValueState.None) {
				continue;
			}

			this.oGenericTag.setStatus(sValueState);

			//act
			oCore.applyChanges();
			sActualIconSrc = sValueState !== ValueState.Information ?
								sStatusIconNamePrefix + sValueState.toLowerCase() :
								sInformationIconSrc;
			//assert
			assert.strictEqual(this.oGenericTag.getAggregation("_statusIcon").getSrc(),
								sActualIconSrc,
								"Status icon should have the correct src set.");
		}
	});

	QUnit.test("GenericTag - setStatus should remove the Status Icon src when ValueState.None", function (assert) {
		//arrange
		var oStatusIcon = this.oGenericTag.getAggregation("_statusIcon");

		assert.ok(oStatusIcon.getSrc());

		//act
		this.oGenericTag.setStatus("None");

		//assert
		assert.notOk(oStatusIcon.getSrc());
	});

	QUnit.module("GenericTag - fire press event", {
		beforeEach: function() {
			this.onPressCallback = sinon.spy();
			this.oGenericTag = new GenericTag({
				press: this.onPressCallback
			}).placeAt(TESTS_DOM_CONTAINER);
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
			this.onPressCallback = null;
		}
	});

	QUnit.test("GenericTag - onclick should fire press event", function(assert) {
		//act
		qutils.triggerEvent("click", this.oGenericTag);

		//assert
		assert.strictEqual(this.onPressCallback.callCount, 1, "'press' event should be triggered.");
	});

	QUnit.test("GenericTag - onkeyup should fire press event when pressing SPACE", function(assert) {
		//act
		qutils.triggerEvent("keyup",this.oGenericTag, { which:KeyCodes.SPACE });

		//assert
		assert.strictEqual(this.onPressCallback.callCount, 1, "'press' event should be triggered.");
	});

	QUnit.test("GenericTag - onkeydown should fire press event when pressing ENTER", function(assert) {
		//act
		qutils.triggerEvent("keydown",this.oGenericTag, { which:KeyCodes.ENTER });

		//assert
		assert.strictEqual(this.onPressCallback.callCount, 1, "'press' event should be triggered.");
	});

	QUnit.test("GenericTag - action interupt", function(assert) {
		testPressInterupt(assert, this.oGenericTag, this.onPressCallback, KeyCodes.SHIFT, "Shift");
		testPressInterupt(assert, this.oGenericTag, this.onPressCallback, KeyCodes.ESCAPE, "Escape");
	});

	function testPressInterupt (assert, oGenericTag, oSpy, iInteruptKeyCode, sKey) {
		//act
		qutils.triggerKeydown(oGenericTag, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeydown");
		assert.ok(oGenericTag._bSpacePressed, "Space key is marked as pressed");

		//act
		qutils.triggerKeydown(oGenericTag, iInteruptKeyCode);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeydown");
		assert.ok(oGenericTag._bSpacePressed, "Space key is marked as pressed");
		assert.ok(oGenericTag._bShouldInterupt, sKey + " key is marked as pressed");

		//act
		qutils.triggerKeyup(oGenericTag, KeyCodes.SPACE);

		//assert
		assert.ok(oSpy.notCalled, "Press event is not fired onkeyup");
		assert.notOk(oGenericTag._bSpacePressed, "Space key is unmarked as pressed");
		assert.notOk(oGenericTag._bShouldInterupt, sKey + " key is unmarked as pressed");
	}

	QUnit.test("GenericTag - onkeyup should not fire press event when not pressing space or enter", function(assert) {
		//act
		qutils.triggerEvent("keyup",this.oGenericTag, { which:KeyCodes.Q });
		//assert
		assert.strictEqual(this.onPressCallback.callCount, 0, "'press' event should not be triggered.");
	});

	QUnit.module("GenericTag - toggle active state", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag().placeAt(TESTS_DOM_CONTAINER);
			this.oToggleActiveGenericTagSpy = this.spy(this.oGenericTag, "_toggleActiveGenericTag");
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
			this.oToggleActiveGenericTagSpy.reset();
			this.oToggleActiveGenericTagSpy = null;
		},
		assertCalledOnceWithExactParam: function(oSpy, bValue, assert) {
			sinon.assert.calledWithExactly(oSpy, bValue);
			assert.strictEqual(oSpy.callCount, 1, "Method should be called only once");
		},
		assertNotCalled: function(oSpy, assert) {
			assert.strictEqual(oSpy.callCount, 0, "Method should not be called only once");
		}
	});

	QUnit.test("onfocusout should remove the active class", function(assert) {
		//act
		this.oGenericTag.onfocusout({});

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, false, assert);
	});

	QUnit.test("ontouchend should remove the active class", function(assert) {
		//act
		qutils.triggerEvent("touchend", this.oGenericTag);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, false, assert);
	});

	QUnit.test("ontouchcancel should remove the active class", function(assert) {
		//act
		qutils.triggerEvent("touchcancel",this.oGenericTag);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, false, assert);
	});

	QUnit.test("onkeyup should remove the active class - SPACE", function(assert) {
		//act
		qutils.triggerKeyup(this.oGenericTag, KeyCodes.SPACE);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, false, assert);
	});

	QUnit.test("onkeyup should remove the active class - ENTER", function(assert) {
		//act
		qutils.triggerKeyup(this.oGenericTag, KeyCodes.ENTER);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, false, assert);
	});

	QUnit.test("onkeyup should not remove the active class - different than SPACE or ENTER", function(assert) {
		//act
		qutils.triggerKeyup(this.oGenericTag, KeyCodes.TAB);

		//assert
		this.assertNotCalled(this.oToggleActiveGenericTagSpy, assert);
	});

	QUnit.test("ontouchstart should apply the active class", function(assert) {
		//act
		qutils.triggerEvent("touchstart", this.oGenericTag);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, true, assert);
	});

	QUnit.test("onkeydown should apply the active class - ENTER", function(assert) {
		//act
		qutils.triggerKeydown(this.oGenericTag, KeyCodes.ENTER);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, true, assert);
	});

	QUnit.test("onkeydown should apply the active class - SPACE", function(assert) {
		//act
		qutils.triggerKeydown(this.oGenericTag, KeyCodes.SPACE);

		//assert
		this.assertCalledOnceWithExactParam(this.oToggleActiveGenericTagSpy, true, assert);
	});

	QUnit.test("onkeydown should not apply the active class - different from SPACE or ENTER", function(assert) {
		//act
		qutils.triggerKeydown(this.oGenericTag, KeyCodes.Q);

		//assert
		this.assertNotCalled(this.oToggleActiveGenericTagSpy, assert);

		//act
		qutils.triggerKeydown(this.oGenericTag, KeyCodes.TAB);

		//assert
		this.assertNotCalled(this.oToggleActiveGenericTagSpy, assert);
	});

	QUnit.module("GenericTag - keydown");

	QUnit.test("onkeydown event should be prevented - SPACE", function(assert) {
		//setup
		var oGenericTag = new GenericTag().placeAt(TESTS_DOM_CONTAINER),
			oEvent = {
				which: KeyCodes.SPACE,
				preventDefault: function () {}
			},
			oSpy = this.spy(oEvent, "preventDefault");

		//act
		oGenericTag.onkeydown(oEvent);

		//assert
		assert.ok(oSpy.calledOnce, "preventDefault is called on SPACE key");

		oGenericTag.destroy();
	});

	QUnit.module("GenericTag - setTooltip", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag().placeAt(TESTS_DOM_CONTAINER);
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
		}
	});

	QUnit.test("There should be no tooltip by default", function(assert) {
		var oGenericTagDomRef = this.oGenericTag.getDomRef();
		assert.ok(oGenericTagDomRef, "The Generic Tag is rendered.");
		assert.equal(oGenericTagDomRef.getAttribute('title'), undefined, "There should be no tooltip by default");
	});

	QUnit.test("setTooltip should set the correct tooltip", function(assert) {
		//arrange
		var sTooltip = "This is the tooltip",
			oGenericTagDomRef;

		//act
		this.oGenericTag.setTooltip(sTooltip);
		oCore.applyChanges();
		oGenericTagDomRef = this.oGenericTag.getDomRef();

		//assert
		assert.ok(oGenericTagDomRef, "The Generic Tag is rendered.");
		assert.equal(oGenericTagDomRef.getAttribute('title'), sTooltip, "setTooltip should set the correct tooltip");
	});

	/* --------------------------- GenericTag Rendering ---------------------------------- */
	QUnit.module("GenericTag - Rendering", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag({
				id: "genericTag",
				value: new ObjectNumber({
					number: 100
				})
			});
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
		},
		assertGenericTagRendered: function(oGenericTag, assert) {
			assert.ok(oGenericTag.getDomRef(), "GenericTag was rendered successfully");
		},
		assertGenericTagSemanticDecoratorRendered: function(oGenericTag, sStatus, assert) {
			assert.ok(oGenericTag.$().hasClass("sapMGenericTag" + sStatus),
				"GenericTag has the correct semantic decorator.");
		},
		assertGenericTagTextRendered: function(oGenericTag, assert) {
			var sTextId = "#" + oGenericTag.getId() + GENERICTAG_TEXT_ID_SUFFIX;
			assert.ok(oGenericTag.getDomRef().querySelector(sTextId));
		},
		assertGenericTagValueRendered: function(oGenericTag, assert) {
			assert.ok(oGenericTag.getValue().getDomRef(), "GenericTag value should be rendered.");
		},
		assertGenericTagValueNotRendered: function(oGenericTag, assert) {
			assert.notOk(oGenericTag.getValue().getDomRef(), "GenericTag value should not be rendered.");
		},
		assertGenericTagStatusIconRendered: function(oGenericTag, assert) {
			assert.ok(oGenericTag.getAggregation("_statusIcon").getDomRef(),
								"GenericTag status icon should be rendered.");
		},
		assertGenericTagStatusIconNotRendered: function(oGenericTag, assert) {
			assert.notOk(oGenericTag.getAggregation("_statusIcon"),
				"GenericTag status icon should not be rendered.");
		},
		assertGenericTagErrorIconRendered: function(oGenericTag, assert) {
			assert.ok(oGenericTag.getAggregation("_errorIcon").getDomRef(),
				"GenericTag error icon should be rendered.");
		},
		assertGenericTagErrorIconNotRendered: function(oGenericTag, assert) {
			assert.notOk(oGenericTag.getAggregation("_errorIcon"),
				"GenericTag error icon should not be rendered.");
		}
	});

	QUnit.test("Semantic decorator", function(assert) {
		//arrange
		this.oGenericTag.placeAt("qunit-fixture");

		Object.keys(ValueState).forEach(function(sValueState){
			this.oGenericTag.setStatus(sValueState);

			//act
			oCore.applyChanges();

			//assert
			this.assertGenericTagSemanticDecoratorRendered(this.oGenericTag, sValueState, assert);
		}, this);
	});

	QUnit.test("GenericTagDesign.Full and GenericTagValueState.None should show all generic tag components", function(assert) {
		//arrange
		this.oGenericTag.setDesign(GenericTagDesign.Full);
		this.oGenericTag.setValueState(GenericTagValueState.None);
		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.placeAt("qunit-fixture");

		//act
		oCore.applyChanges();

		//assert
		this.assertGenericTagRendered(this.oGenericTag, assert);
		this.assertGenericTagSemanticDecoratorRendered(this.oGenericTag, this.oGenericTag.getStatus(), assert);
		this.assertGenericTagStatusIconRendered(this.oGenericTag, assert);
		this.assertGenericTagTextRendered(this.oGenericTag, assert);
		this.assertGenericTagValueRendered(this.oGenericTag, assert);
		this.assertGenericTagErrorIconNotRendered(this.oGenericTag, assert);
	});

	QUnit.test("GenericTagDesign.Full and GenericTagValueState.Error should render error icon", function(assert) {
		//arrange
		this.oGenericTag.setDesign(GenericTagDesign.Full);
		this.oGenericTag.setValueState(GenericTagValueState.Error);
		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.placeAt("qunit-fixture");

		//act
		oCore.applyChanges();

		//assert
		this.assertGenericTagRendered(this.oGenericTag, assert);
		this.assertGenericTagSemanticDecoratorRendered(this.oGenericTag, this.oGenericTag.getStatus(), assert);
		this.assertGenericTagStatusIconRendered(this.oGenericTag, assert);
		this.assertGenericTagTextRendered(this.oGenericTag, assert);
		this.assertGenericTagValueNotRendered(this.oGenericTag, assert);
		this.assertGenericTagErrorIconRendered(this.oGenericTag, assert);
	});

	QUnit.test("GenericTagDesign.StatusIconHidden and GenericTagValueState.None should not display status icon", function(assert){
		//arrange
		this.oGenericTag.setDesign(GenericTagDesign.StatusIconHidden);
		this.oGenericTag.setValueState(GenericTagValueState.None);
		this.oGenericTag.placeAt("qunit-fixture");

		//act
		oCore.applyChanges();

		//assert
		this.assertGenericTagRendered(this.oGenericTag, assert);
		this.assertGenericTagSemanticDecoratorRendered(this.oGenericTag, this.oGenericTag.getStatus(), assert);
		this.assertGenericTagStatusIconNotRendered(this.oGenericTag, assert);
		this.assertGenericTagTextRendered(this.oGenericTag, assert);
		this.assertGenericTagValueRendered(this.oGenericTag, assert);
		this.assertGenericTagErrorIconNotRendered(this.oGenericTag, assert);
	});

	QUnit.test(
		"GenericTagDesign.StatusIconHidden and GenericTagValueState.Error should not render status icon but render error icon", function(assert){
		//arrange
		this.oGenericTag.setDesign(GenericTagDesign.StatusIconHidden);
		this.oGenericTag.setValueState(GenericTagValueState.Error);
		this.oGenericTag.placeAt("qunit-fixture");

		//act
		oCore.applyChanges();

		//assert
		this.assertGenericTagRendered(this.oGenericTag, assert);
		this.assertGenericTagSemanticDecoratorRendered(this.oGenericTag, this.oGenericTag.getStatus(), assert);
		this.assertGenericTagStatusIconNotRendered(this.oGenericTag, assert);
		this.assertGenericTagTextRendered(this.oGenericTag, assert);
		this.assertGenericTagValueNotRendered(this.oGenericTag, assert);
		this.assertGenericTagErrorIconRendered(this.oGenericTag, assert);
	});

	/* --------------------------- GenericTag ARIA ---------------------------------- */
	QUnit.module("GenericTag - ARIA State", {
		beforeEach: function() {
			this.oGenericTag = new GenericTag({
				id: "genericTag",
				value: new ObjectNumber({
					number: 456,
					unit: "EUR"
				})
			});
			this.oGenericTag.placeAt("qunit-fixture");
			this.sStatusTextId = this.oGenericTag.getId() + GENERICTAG_STATUSTEXT_ID_SUFFIX;
			this.sTextId = this.oGenericTag.getId() + GENERICTAG_TEXT_ID_SUFFIX;
		},
		afterEach: function() {
			this.oGenericTag.destroy();
			this.oGenericTag = null;
		}
	});

	QUnit.test("GenericTag has the correct roledescription", function(assert){
		var sRole = "button",
			oResourceBundle =  oCore.getLibraryResourceBundle("sap.m"),
			sRoleDescription = oResourceBundle.getText("GENERICTAG_ROLEDESCRIPTION"),
			$genericTag;
		//act
		oCore.applyChanges();
		$genericTag = this.oGenericTag.$();

		//assert
		assert.equal($genericTag.attr("role"), sRole, "GenericTag role is 'button'.");
		assert.equal($genericTag.attr("aria-roledescription"), sRoleDescription,
			"GenericTag roledescription is 'Object Tag'.");
	});

	QUnit.test("GenericTag has no ARIA status text when Status is ValueState.None", function(assert) {
		//arrange
		var $genericTag,
			sAriaLabelledBy;

		this.oGenericTag.setStatus(ValueState.None);

		//act
		oCore.applyChanges();

		//assert
		$genericTag = this.oGenericTag.$();
		sAriaLabelledBy = $genericTag.attr("aria-labelledby");

		assert.equal(sAriaLabelledBy.indexOf(this.sStatusTextId), -1,
			"GenericTag has no status text in the 'aria-labelledby' attribute.");
	});

	QUnit.test("GenericTag has the correct status text when Status is not ValueState.None", function(assert){
		//arrange
		var $genericTag,
			$statusText,
			sAriaLabelledBy;

		for (var sValueState in ValueState) {
			if (sValueState === ValueState.None) {
				continue;
			}

			this.oGenericTag.setStatus(sValueState);

			//act
			oCore.applyChanges();

			//assert
			$genericTag = this.oGenericTag.$();
			$statusText = $genericTag.find("#" + this.sStatusTextId);
			sAriaLabelledBy = $genericTag.attr("aria-labelledby");

			assert.ok($statusText, "GenericTag has it's status text rendered.");
			assert.notEqual(sAriaLabelledBy.indexOf(this.sStatusTextId), -1,
				"GenericTag has the status text id in the 'aria-labelledby' attribute.");
			assert.equal($statusText.text(), GenericTagRenderer._getGenericTagStatusText(this.oGenericTag),
				"GenericTag has the correct status text");
		}
	});

	QUnit.test(
		"GenericTag has the correct ARIA state - GenericTagDesign.Full and GenericTagValueState.None", function(assert){
		//arrange
		var $genericTag,
			sValueId;

		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.setDesign(GenericTagDesign.Full);
		this.oGenericTag.setValueState(GenericTagValueState.None);

		//act
		oCore.applyChanges();

		$genericTag = this.oGenericTag.$();
		sValueId = GenericTagRenderer._getTagValueId(this.oGenericTag);

		//assert
		assert.equal($genericTag.attr("aria-labelledby"), [this.sStatusTextId, this.sTextId, sValueId].join(" "));
	});

	QUnit.test(
		"GenericTag has the correct ARIA state - GenericTagDesign.Full and GenericTagValueState.Error", function(assert){
		//arrange
		var $genericTag,
			sErrorIconId;

		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.setDesign(GenericTagDesign.Full);
		this.oGenericTag.setValueState(GenericTagValueState.Error);

		//act
		oCore.applyChanges();

		$genericTag = this.oGenericTag.$();
		sErrorIconId = this.oGenericTag.getAggregation("_errorIcon").getId();

		//assert
		assert.equal($genericTag.attr("aria-labelledby"), [this.sStatusTextId, this.sTextId, sErrorIconId].join(" "));
	});

	QUnit.test(
		"GenericTag has the correct ARIA state - GenericTagDesign.StatusIconHidden and GenericTagValueState.None", function(assert){
		//arrange
		var $genericTag,
			sValueId;

		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.setDesign(GenericTagDesign.StatusIconHidden);
		this.oGenericTag.setValueState(GenericTagValueState.None);

		//act
		oCore.applyChanges();

		$genericTag = this.oGenericTag.$();
		sValueId = GenericTagRenderer._getTagValueId(this.oGenericTag);

		//assert
		assert.equal($genericTag.attr("aria-labelledby"), [this.sStatusTextId, this.sTextId, sValueId].join(" "));
	});

	QUnit.test(
		"GenericTag has the correct ARIA state - GenericTagDesign.StatusIconHidden and GenericTagValueState.Error", function(assert){
		//arrange
		var $genericTag,
			sErrorIconId;

		this.oGenericTag.setStatus(ValueState.Information);
		this.oGenericTag.setDesign(GenericTagDesign.StatusIconHidden);
		this.oGenericTag.setValueState(GenericTagValueState.Error);

		//act
		oCore.applyChanges();

		$genericTag = this.oGenericTag.$();
		sErrorIconId = this.oGenericTag.getAggregation("_errorIcon").getId();

		//assert
		assert.equal($genericTag.attr("aria-labelledby"), [this.sStatusTextId, this.sTextId, sErrorIconId].join(" "));
	});

	QUnit.module("Test behavior in overflow toolbar", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
		},
		afterEach: function() {
			this.clock.restore();
		}
	});

	QUnit.test("Generic tag gets inside overflow toolbar", function (assert) {
		var oSingleGenericTag = new GenericTag({ text: "Test Generic Tag"}),
			aToolbarContent = [
				new ToolbarSpacer(),
				oSingleGenericTag
			],
			oOverflowTB = new OverflowToolbar({
				width: 'auto',
				content: aToolbarContent
			});
		oOverflowTB.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		// set small width that causes all content to move to the OverflowToolbar
		oOverflowTB.setWidth("1rem");
		this.clock.tick(1000);

		assert.strictEqual(
			oSingleGenericTag.hasStyleClass(GenericTag.CLASSNAME_OVERFLOW_TOOLBAR),
			true, "Generic tag gets inside overflow toolbar");

		// remove the labelled control
		oOverflowTB.setWidth('20rem');
		this.clock.tick(1000);

		assert.strictEqual(
			oSingleGenericTag.hasStyleClass(GenericTag.CLASSNAME_OVERFLOW_TOOLBAR),
			false, "Generic tag gets outside overflow toolbar");

		oOverflowTB.destroy();
	});
});
