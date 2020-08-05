/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/semantic/SemanticPage",
	"sap/m/semantic/SemanticButton",
	"sap/m/semantic/AddAction",
	"sap/m/semantic/EditAction",
	"sap/m/semantic/NegativeAction",
	"sap/m/semantic/CancelAction",
	"sap/m/semantic/FlagAction",
	"sap/m/semantic/MultiSelectAction",
	"sap/m/semantic/SemanticOverflowToolbarButton",
	"sap/ui/model/json/JSONModel",
	"sap/m/Button",
	"sap/m/Popover",
	"sap/m/Label",
	"sap/m/semantic/DetailPage",
	"sap/m/semantic/MasterPage",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(
	qutils,
	createAndAppendDiv,
	SemanticPage,
	SemanticButton,
	AddAction,
	EditAction,
	NegativeAction,
	CancelAction,
	FlagAction,
	MultiSelectAction,
	SemanticOverflowToolbarButton,
	JSONModel,
	Button,
	Popover,
	Label,
	DetailPage,
	MasterPage,
	KeyCodes,
	jQuery,
	Core
) {
	createAndAppendDiv("qunit-fixture-visible");



	//

	var oBundle = Core.getLibraryResourceBundle("sap.m");

	function capitalize(sName) {
		return sName.substring(0, 1).toUpperCase() + sName.substring(1);
	}

	function testPropertyInitValue(fnClass, sPropertyName, oExpectedInitValue, oMetadata) {

		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);

		QUnit.test("semantic action has correct init " + sPropertyName, function(assert) {

			assert.strictEqual(oButton.getProperty(sPropertyName), oExpectedInitValue, "action has correct init " + sPropertyName);
			assert.strictEqual(oButton["get" + capitalize(sPropertyName)](), oExpectedInitValue, "action has correct init " + sPropertyName);
			oButton.destroy();
		});
	}

	function testSetProperty(fnClass, sPropertyName, oModifiedValue, oMetadata) {

		// Arrange
		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);

		QUnit.test("setProperty" + sPropertyName, function (assert) {

			// Act
			oButton.setProperty(sPropertyName, oModifiedValue);

			// Assert
			assert.strictEqual(oButton.getProperty(sPropertyName), oModifiedValue, "property " + sPropertyName + " is modified correctly");
			assert.strictEqual(oButton["get" + capitalize(sPropertyName)](), oModifiedValue, "property " + sPropertyName + " is modified correctly");

			// Clean up
			oButton.destroy();
		});
	}

	function testPropertyModifier(fnClass, sPropertyName, oModifiedValue, oMetadata) {

		// Arrange
		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);
		var sModifier = "set" + capitalize(sPropertyName);

		QUnit.test("test " + sModifier, function (assert) {

			// Act
			oButton[sModifier](oModifiedValue);

			// Assert
			assert.strictEqual(oButton.getProperty(sPropertyName), oModifiedValue, "property " + sPropertyName + " is modified correctly");
			assert.strictEqual(oButton["get" + capitalize(sPropertyName)](), oModifiedValue, "property " + sPropertyName + " is modified correctly");

			// Clean up
			oButton.destroy();
		});

	}

	function testDataBinding(fnClass, sField, oModifiedValue, oMetadata) {

		var oModel = new JSONModel({modifiedValue: oModifiedValue});
		var oBindingInfo = {};
		oBindingInfo[sField] = "{/modifiedValue}";
		oMetadata || (oMetadata = {});

		QUnit.test(sField + " correct binding when bindingInfo and model in metadata", function (assert) {
			// Arrange
			var oExtendedMetadata = jQuery.extend({}, oMetadata, oBindingInfo, {models: oModel});
			var oButton = new fnClass(oExtendedMetadata);

			// Assert
			assert.strictEqual(oButton["get" + capitalize(sField)](), oModifiedValue, "property " + sField + " is modified correctly");
		});

		QUnit.test(sField + " correct binding when bindingInfo in metadata", function (assert) {
			// Arrange
			var oExtendedMetadata = jQuery.extend({}, oMetadata, oBindingInfo);
			var oButton = new fnClass(oExtendedMetadata);

			//Act
			oButton.setModel(oModel);

			// Assert
			assert.strictEqual(oButton["get" + capitalize(sField)](), oModifiedValue, "property " + sField + " is modified correctly");
		});

		QUnit.test(sField + " correct binding when model in metadata", function (assert) {
			// Arrange
			var oExtendedMetadata = jQuery.extend({}, oMetadata, {models: oModel});
			var oButton = new fnClass(oExtendedMetadata);

			// Act
			oButton.bindProperty(sField, "/modifiedValue");

			// Assert
			assert.strictEqual(oButton["get" + capitalize(sField)](), oModifiedValue, "property " + sField + " is modified correctly");
		});

		QUnit.test(sField + " correct binding via bindProperty and setModel", function (assert) {
			// Arrange
			var oButton = new fnClass(oMetadata);

			// Act
			oButton.bindProperty(sField, "/modifiedValue");
			oButton.setModel(oModel);

			// Assert
			assert.strictEqual(oButton["get" + capitalize(sField)](), oModifiedValue, "property " + sField + " is modified correctly");
		});

	}


	function testDataBindingAfterUnbind(fnClass, sField, oInitValue, oModifiedValue, oMetadata) {

		var oModel = new JSONModel({modifiedValue: oModifiedValue});
		var oBindingInfo = {};
		oBindingInfo[sField] = "{/modifiedValue}";
		oMetadata || (oMetadata = {});

		QUnit.test(sField + " correct binding after unbind", function (assert) {

		 var oModel = new JSONModel({initValue: oInitValue,
														modifiedValue: oModifiedValue});
		 var oBindingInfo = {};
		 oBindingInfo[sField] = "{/initValue}";


		 // Arrange
		 var oExtendedMetadata = jQuery.extend({}, oMetadata, oBindingInfo, {models: oModel});
		 var oButton = new fnClass(oExtendedMetadata);

		 // Assert
		 assert.strictEqual(oButton["get" + capitalize(sField)](), oInitValue, "property " + sField + " is modified correctly");

		 // Act
		 oButton.bindProperty(sField, "/modifiedValue");
		 oButton.setModel(oModel);

		 // Assert
		 assert.strictEqual(oButton["get" + capitalize(sField)](), oModifiedValue, "property " + sField + " is modified correctly");
		 });

	}

	function testAggregationInitValue(fnClass, sAggregationName, oExpectedInitValue, oMetadata) {

		// Arrange
		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);

		QUnit.test("semantic button with no type has correct init " + sAggregationName, function(assert) {

			assert.strictEqual(oButton.getAggregation(sAggregationName), oExpectedInitValue, "button with no type has correct init " + sAggregationName);
			assert.strictEqual(oButton["get" + capitalize(sAggregationName)](), oExpectedInitValue, "button with no type has correct init " + sAggregationName);
			oButton.destroy();
		});
	}

	function testSetAggregation(fnClass, sAggregationName, oModifiedValue, oMetadata) {

		// Arrange
		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);

		QUnit.test("setAggregation" + sAggregationName, function (assert) {

			// Act
			oButton.setAggregation(sAggregationName, oModifiedValue);

			// Assert
			assert.strictEqual(oButton.getAggregation(sAggregationName), oModifiedValue, "aggregation " + sAggregationName + " is modified correctly");
			assert.strictEqual(oButton["get" + capitalize(sAggregationName)](), oModifiedValue, "aggregation " + sAggregationName + " is modified correctly");

			// Clean up
			oButton.destroy();
		});

	}

	function testAggregationModifier(fnClass, sAggregatioName, oModifiedValue, oMetadata) {

		// Arrange
		oMetadata || (oMetadata = {});
		var oButton = new fnClass(oMetadata);
		var sModifier = "set" + capitalize(sAggregatioName);

		QUnit.test("test " + sModifier, function (assert) {

			// Act
			oButton[sModifier](oModifiedValue);

			// Assert
			assert.strictEqual(oButton.getAggregation(sAggregatioName), oModifiedValue, "property " + sAggregatioName + " is modified correctly");
			assert.strictEqual(oButton["get" + capitalize(sAggregatioName)](), oModifiedValue, "property " + sAggregatioName + " is modified correctly");

			// Clean up
			oButton.destroy();
		});

	}

	QUnit.module("id");

	QUnit.test("semantic control can be retrieved by Id", function (assert) {
		// Arrange
		var oEditButton = new EditAction("editBtn");

		assert.strictEqual(oEditButton.getId(), "editBtn", "control has the expected id");

		// Act
		var oRetrievedBtn = Core.byId("editBtn");

		// Assert
		assert.notEqual(oRetrievedBtn, undefined, "the button is retrieved by id");
		assert.strictEqual(oRetrievedBtn.getId(), "editBtn", "control has the expected id");

		oEditButton.destroy();
	});

	QUnit.module("init values");

	testPropertyInitValue(AddAction, "enabled", true);
	testPropertyInitValue(AddAction, "visible", true);
	testPropertyInitValue(FlagAction, "pressed", false);
	testPropertyInitValue(MultiSelectAction, "pressed", false);
	testAggregationInitValue(EditAction, "tooltip", null);


	QUnit.module("modifiers");

	testSetProperty(AddAction, "enabled", false);
	testSetProperty(AddAction, "visible", false);
	testSetProperty(FlagAction, "pressed", true);
	testSetAggregation(EditAction, "tooltip", "newTooltip");
	testPropertyModifier(AddAction, "enabled", false);
	testPropertyModifier(AddAction, "visible", false);
	testAggregationModifier(EditAction, "tooltip", "newTooltip");


	QUnit.module("data binding");

	testDataBinding(AddAction, "enabled", false);
	testDataBindingAfterUnbind(AddAction, "enabled", false, true);

	testDataBinding(AddAction, "tooltip", "newTooltipValue");
	testDataBindingAfterUnbind(AddAction, "tooltip", "newTooltipValue", "nextTooltipValue");

	testDataBinding(FlagAction, "pressed", true);
	testDataBindingAfterUnbind(FlagAction, "pressed", true, false);

	testDataBinding(MultiSelectAction, "pressed", true);
	testDataBindingAfterUnbind(MultiSelectAction, "pressed", true, false);

	QUnit.module("inaccessible properties");

	QUnit.test("Semantic buttons should not allow setting icon value to them", function (assert) {
		// Arrange
		var oEditButton = new EditAction(""),
				oRejectButton = new NegativeAction(""),
				testIcon = 'sap-icon://settings';

		var iNumExceptions = 0;

		// Act
		try {
			oRejectButton.setProperty("icon", testIcon);
		} catch (e) {
			iNumExceptions++;
		}

		// Act
		try {
			oEditButton.setProperty("icon", testIcon);
		} catch (e) {
			iNumExceptions++;
		}

		assert.ok(iNumExceptions === 2, "Two errors are generated, because the property icon does not exist");

		// Clean up
		oRejectButton.destroy();
		oEditButton.destroy();
	});

	QUnit.test("Semantic buttons should not allow setting text value to them", function (assert) {
		// Arrange
		var oEditButton = new EditAction(""),
				oCancelAction = new CancelAction(),
				testText = 'Test';

		var iNumExceptions = 0;

		// Act
		try {
			oCancelAction.setProperty("text", testText);
		} catch (e) {
			iNumExceptions++;
		}

		// Act
		try {
			oEditButton.setProperty("text", testText);
		} catch (e) {
			iNumExceptions++;
		}

		assert.ok(iNumExceptions === 2, "Two errors are generated, because the property text does not exist");

		// Clean up
		oCancelAction.destroy();
		oEditButton.destroy();
	});

	QUnit.test("FlagAction pressed in metadata", function(assert) {
		//setup
		var oFlagAction = new FlagAction({
			pressed: true
		});

		//act
		assert.strictEqual(oFlagAction.getPressed(), true, "pressed is set to by metadata");

		//cleanup
		oFlagAction.destroy();
	});

	QUnit.test("FlagAction aria-pressed attribute", function(assert) {
		//setup
		var oFlagAction = new FlagAction({}),
			oSemanticPage = new DetailPage({
				flagAction: oFlagAction
			});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		//assert
		assert.strictEqual(oFlagAction.$().attr("aria-pressed"), "false", "aria-pressed attribute is set to false");

		//act
		oFlagAction.setPressed(true);
		Core.applyChanges();

		//assert
		assert.strictEqual(oFlagAction.$().attr("aria-pressed"), "true", "aria-pressed attribute is set to true");

		//cleanup
		oSemanticPage.destroy();
	});

	QUnit.module("domRef available");

	QUnit.test("Popover can be opened by a semantic button", function(assert) {

		var oSpy = this.spy();

		var oPopover = new Popover({
				content: new Label({text: "Popover"}),
				afterOpen: oSpy
				});

		var oEditButton = new EditAction({
			press: function() {
				oPopover.openBy(oEditButton);
			}
		});

		var oSemanticPage = new DetailPage({
			editAction: oEditButton
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		// Act
		oEditButton.firePress();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "Popover was opened");

		oPopover.close();

		// Clean up
		oPopover.destroy();
		oSemanticPage.destroy();

	});

	QUnit.test("Semantic button provides domRef", function(assert) {

		var oEditButton = new EditAction();

		var oSemanticPage = new DetailPage({
			editAction: oEditButton
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		// Act
		var $ref = oEditButton.getDomRef();
		// Assert
		assert.notEqual($ref, null, "reference to dom returned");
		assert.strictEqual($ref, oEditButton._getControl().getDomRef(), "correct reference to dom returned");

		// Clean up
		oSemanticPage.destroy();

	});

	QUnit.module("multiSelectAction");

	QUnit.test("MultiSelectAction has correct default value", function(assert) {

		var oMultiSelectAction = new MultiSelectAction();

		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oMultiSelectAction.getPressed(), false, "multiselect off by default");
		assert.strictEqual(oMultiSelectAction._getControl().getIcon(), "sap-icon://multi-select", "multiselect off by default");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.test("MultiSelectAction has correct value when pressed", function(assert) {

		var oSpy = this.spy();
		var oMultiSelectAction = new MultiSelectAction("multiAction", {press: oSpy});

		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		//Act
		jQuery(oMultiSelectAction.getDomRef()).trigger('tap');

		// Assert
		assert.strictEqual(oMultiSelectAction.getPressed(), true, "multiselect on after press");
		assert.strictEqual(oMultiSelectAction._getControl().getIcon(), "sap-icon://sys-cancel", "multiselect icon correct after press");
		assert.strictEqual(oSpy.callCount, 1, "press was called once");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.test("MultiSelectAction has correct value when unpressed", function(assert) {

		var oSpy = this.spy();
		var oMultiSelectAction = new MultiSelectAction("multiAction", {press: oSpy});


		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		//Act
		jQuery(oMultiSelectAction.getDomRef()).trigger('tap');
		jQuery(oMultiSelectAction.getDomRef()).trigger('tap');

		// Assert
		assert.strictEqual(oMultiSelectAction.getPressed(), false, "multiselect on after unpress");
		assert.strictEqual(oMultiSelectAction._getControl().getIcon(), "sap-icon://multi-select", "multiselect icon correct after unpress");
		assert.strictEqual(oSpy.callCount, 2, "press was called twice");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.test("MultiSelectAction has correct value after pressed with keydown", function(assert) {

		var oSpy = this.spy();
		var oMultiSelectAction = new MultiSelectAction("multiAction", {press: oSpy});

		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		//Act
		qutils.triggerKeyup(oMultiSelectAction.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.strictEqual(oMultiSelectAction.getPressed(), true, "multiselect on after press");
		assert.strictEqual(oMultiSelectAction._getControl().getIcon(), "sap-icon://sys-cancel", "multiselect icon correct after press");
		assert.strictEqual(oSpy.callCount, 1, "press was called once");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.test("MultiSelectAction has correct value when unpressed with keydown", function(assert) {

		var oSpy = this.spy();
		var oMultiSelectAction = new MultiSelectAction("multiAction", {press: oSpy});


		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		//Act
		qutils.triggerKeyup(oMultiSelectAction.getDomRef(), KeyCodes.SPACE);
		qutils.triggerKeyup(oMultiSelectAction.getDomRef(), KeyCodes.SPACE);

		// Assert
		assert.strictEqual(oMultiSelectAction.getPressed(), false, "multiselect on after unpress");
		assert.strictEqual(oMultiSelectAction._getControl().getIcon(), "sap-icon://multi-select", "multiselect icon correct after unpress");
		assert.strictEqual(oSpy.callCount, 2, "press was called twice");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.test("MultiSelectAction enabled property", function(assert) {

		var oStatusModel = new JSONModel({ master: { multiSelectEnabled: false } });
		var oMultiSelectAction = new MultiSelectAction("multiAction", {enabled: "{status>/master/multiSelectEnabled}"});

		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});
		oSemanticPage.setModel(oStatusModel, "status");

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		// Assert
		assert.strictEqual(oMultiSelectAction.getEnabled(), false, "baound value initialized correctly");

		// Act
		oStatusModel.setData({master: {multiSelectEnabled: true}}, true);

		// Assert
		assert.strictEqual(oMultiSelectAction.getEnabled(), true, "baound value changed correctly");

		// Clean up
		oSemanticPage.destroy();
	});

	QUnit.module("eventDelegate");

	QUnit.test("add callback", function(assert) {

		var oMultiSelectAction = new MultiSelectAction("multiAction"),
			callback = sinon.spy();

		var oResult = oMultiSelectAction.addEventDelegate({onAfterRendering: callback});
		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		assert.strictEqual(callback.calledOnce, true, "delegate is called");

		oSemanticPage.destroy();
	});

	QUnit.test("callback references the semantic object", function(assert) {

		var oMultiSelectAction = new MultiSelectAction("multiAction"),
				callback = sinon.spy();

		var oResult = oMultiSelectAction.addEventDelegate({onAfterRendering: callback});
		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		assert.strictEqual(callback.getCall(0).args[0].srcControl.getId(), "multiAction");
		assert.strictEqual(oResult.getId(), "multiAction");

		oSemanticPage.destroy();
	});

	QUnit.test("addEventDelegate returns the semantic object", function(assert) {

		var oMultiSelectAction = new MultiSelectAction("multiAction"),
				callback = sinon.spy();

		var oResult = oMultiSelectAction.addEventDelegate({onAfterRendering: callback});
		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		assert.strictEqual(oResult.getId(), "multiAction");

		oSemanticPage.destroy();
	});

	QUnit.test("remove callback", function(assert) {

		var oMultiSelectAction = new MultiSelectAction("multiAction"),
				callback = sinon.spy(),
				oDelegate = {onAfterRendering: callback};

		oMultiSelectAction.addEventDelegate(oDelegate);
		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		assert.strictEqual(callback.calledOnce, true, "delegate is called");

		var oResult = oMultiSelectAction.removeEventDelegate(oDelegate);

		oSemanticPage.rerender();
		Core.applyChanges();

		assert.strictEqual(callback.calledOnce, true, "delegate is called only once");

		oSemanticPage.destroy();
	});

	QUnit.test("removeEventDelegate returns the semantic object", function(assert) {

		var oMultiSelectAction = new MultiSelectAction("multiAction"),
				callback = sinon.spy(),
				oDelegate = {onAfterRendering: callback};

		oMultiSelectAction.addEventDelegate(oDelegate);
		var oSemanticPage = new MasterPage({
			multiSelectAction: oMultiSelectAction
		});

		oSemanticPage.placeAt("qunit-fixture-visible");
		Core.applyChanges();

		assert.strictEqual(callback.calledOnce, true, "delegate is called");

		var oResult = oMultiSelectAction.removeEventDelegate(oDelegate);

		assert.strictEqual(oResult.getId(), "multiAction");

		oSemanticPage.destroy();
	});

	QUnit.module("private members", {
		beforeEach: function () {
			this.oSemanticButton = new AddAction(); // using AddAction for configuration
		},
		afterEach: function () {
			this.oSemanticButton.destroy();
			this.oSemanticButton = null;
		}
	});

	QUnit.test("_getClass", function (assert) {
		// Arrange
		var oClassIconOnly = this.oSemanticButton._getClass({constraints: "IconOnly"}),
			oClass = this.oSemanticButton._getClass();

		// Assert
		assert.strictEqual(oClassIconOnly === SemanticOverflowToolbarButton, true,
			"Should return SemanticOverflowButton constructor");
		assert.strictEqual(oClass === Button, true,
			"Should return Button constructor");
	});
});