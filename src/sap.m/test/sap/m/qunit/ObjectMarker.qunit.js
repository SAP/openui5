/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/ObjectMarker",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/ColumnListItem",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(
	qutils,
	ObjectMarker,
	mobileLibrary,
	JSONModel,
	Table,
	Column,
	Label,
	ColumnListItem,
	KeyCodes,
	jQuery,
	oCore
) {
	"use strict";

	// shortcut for sap.m.ObjectMarkerVisibility
	var ObjectMarkerVisibility = mobileLibrary.ObjectMarkerVisibility;

	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;


	var oRB = oCore.getLibraryResourceBundle("sap.m");

	QUnit.module("Rendering");

	QUnit.test("Creating control should add it in the DOM", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.strictEqual(oMarker.$().length, 1, "Control is in the DOM.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Creating control w/o setting type property", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.strictEqual(oMarker.$().children().length, 0, "Object Marker inner control is not rendered when type is not set.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Creating an interactive control", function(assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft,
			press: function() {}
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().find(".sapMLnk").length, "The inner control is rendered as sap.m.Link when a press event is set.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Creating an non-interactive control", function(assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().find(".sapMText").length, "The inner control is rendered as sap.m.Text when a press event is not set.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.module("Default rendering of different types");

	QUnit.test("Flagged", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Flagged
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(!oMarker.$().text().length, "Control text is not visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Favorite", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Favorite
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(!oMarker.$().text().length, "Control text is not visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Draft", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible by default.");
		assert.ok(!(oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is not visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Locked", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Locked
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Locked By", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.LockedBy
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Unsaved", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Unsaved
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("UnsavedBy", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.UnsavedBy
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible by default.");
		assert.ok((oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is visible by default.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.module("Visibility");

	QUnit.test("Resize control to change the device size", function(assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Locked
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Act
		sinon.stub(oMarker, "_getDeviceType").returns("small");
		oMarker._handleMediaChange();

		oCore.applyChanges();

		// Assert
		assert.ok(!oMarker.$().text().length, "Control now does not show the text.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Explicitly set visibility", function(assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Locked
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible when visibility is set to IconAndText.");
		assert.ok(oMarker.$().find(".sapUiIcon").length, "Control icon is visible when visibility is set to IconAndText.");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);

		oCore.applyChanges();

		// Assert
		assert.ok(!oMarker.$().text().length, "Control text is not visible when visibility is set to IconOnly.");
		assert.ok(oMarker.$().find(".sapUiIcon").length, "Control icon is visible when visibility is set to IconOnly.");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.TextOnly);

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().text().length, "Control text is visible when visibility is set to TextOnly.");
		assert.ok(!(oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content") && oMarker.$().find(".sapUiIcon").attr("data-sap-ui-icon-content").length), "Control icon is not visible when visibility is set to TextOnly.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Switch interactive/non-interactive mode", function(assert) {
		var fn = function () {};

		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Locked
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Act
		oMarker.attachPress(fn);

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().find(".sapMLnk").length, "The inner control is re-rendered as sap.m.Link when a press event is set.");

		// Act
		oMarker.detachPress(fn);

		oCore.applyChanges();

		// Assert
		assert.ok(oMarker.$().find(".sapMText").length, "The inner control is re-rendered as sap.m.Text when a press event is set.");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.module("Eventing");

	QUnit.test("Fire 'press' event when an inner link control is clicked", function(assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft,
			press: function(oEvent) {
				assert.ok(true, "This should be executed when the link is triggered");
			}
		});

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.expect(1);
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oMarker.$("link")); //should fire event
		qutils.triggerEvent((jQuery.support.touch ? "tap" : "click"), oMarker.getId()); //should not fire event

		// Cleanup
		oMarker.destroy();
	});

	QUnit.module("Binding");

	QUnit.test("Binding - standalone", function(assert) {
		// Arrange
		var oModel = new JSONModel();
		oModel.setData({ modelData: { type: ObjectMarkerType.Locked }});

		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.Draft,
			visibility: ObjectMarkerVisibility.TextOnly
		});
		oMarker.setModel(oModel);

		// Act
		oMarker.bindProperty("type", "/modelData/type");

		oMarker.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.strictEqual(oMarker.getType(), ObjectMarkerType.Locked, "Control type is set to 'Locked' via binding");

		// Act
		var sExpectedText = oRB.getText('OM_FAVORITE');
		oModel.setData({ modelData: { type: ObjectMarkerType.Favorite }});
		oMarker.setModel(oModel);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oMarker.$("text").text(), sExpectedText, "Control type is displayed as 'Favorite' after re-binding");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Binding - table", function(assert) {
		// Arrange
		var oModel = new JSONModel();
		oModel.setData({ modelData: [{ lastName: "Dente", name: "Al", type: ObjectMarkerType.Locked }] });

		var oTable = new Table({
			columns : [
				new Column({
					header : new Label({
						text : "Object Marker (active)"
					})
				})
			]
		});
		oTable.setModel(oModel);

		// Act
		oTable.bindItems("/modelData", new ColumnListItem({
			cells : [
				new ObjectMarker({
					type: "{type}",
					press: function() {}
				})
			]
		}));

		var sExpectedText = oRB.getText('OM_LOCKED');

		oTable.placeAt("qunit-fixture");

		oCore.applyChanges();

		// Assert
		assert.strictEqual(oTable.$().find(".sapMLnk").text(), sExpectedText, "Object Marker type is set to 'Locked' via binding");

		// Cleanup
		oTable.destroy();
	});

	QUnit.test("Rendering of ObjectMarket inside Table, does not invalidate the Table", function(assert) {
		// Arrange
		var oData = {
			items: [
				{ type: ObjectMarkerType.Locked },
				{ type: ObjectMarkerType.Flagged },
				{ type: ObjectMarkerType.Draft },
				{ type: ObjectMarkerType.Favorite }
			]
		};

		var oTable = new Table({
			growing: true,
			growingThreshold: 2
		});

		oTable.addColumn(new Column({ header: new Label({ text: "Object Marker" })}));

		oTable.setModel(new JSONModel(oData));
		oTable.bindAggregation("items", "/items", new ColumnListItem({
			cells: new ObjectMarker({ type: "{type}" })
		}));

		oTable.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Assert
		assert.equal(oTable.getItems().length, 2, "2 ObjectMarkers are shown in the table, growing is not triggered");

		// Act
		var oRenderSpy = this.spy(oTable, "invalidate");
		var $trigger = oTable.$("trigger").trigger("focus");
		qutils.triggerKeydown($trigger, KeyCodes.SPACE);

		// Assert
		assert.strictEqual(oTable.getItems().length, 4, "2 more ObjectMarkers were rendered");
		assert.strictEqual(oRenderSpy.callCount, 0, "Table did not re-render");

		// Cleanup
		oTable.destroy();
	});


	QUnit.module("Helper methods");

	QUnit.test("_getInnerControl private method", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker();

		// Assert
		assert.strictEqual(oMarker._getInnerControl(), null, "Requesting inner control without setting type should return null");

		// Act
		oMarker.setType(ObjectMarkerType.Flagged);

		// Assert
		assert.ok(oMarker._getInnerControl(), "Inner control should be returned instead of null");
	});

	QUnit.test("_adjustControl private method", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker();

		// Assert
		assert.strictEqual(oMarker._adjustControl(), false, "Adjusting inner control without setting type should return false thus" +
				"not trying to execute further adjustments to the control because in this setup the control will not" +
				"render and no inner control will be available that would cause errors from the method trying to access" +
				"it's properties");
	});

	QUnit.module("AdditionalInfo");

	QUnit.test("Setter and getter", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker();

		// Assert
		assert.strictEqual(oMarker.getAdditionalInfo(), "", "The default additional info value of the API should be an empty string");

		// Act
		oMarker.setAdditionalInfo("by John Doe");

		// Assert
		assert.strictEqual(oMarker.getProperty("additionalInfo"), "by John Doe", "Previously set additional info should be retrieved");
		assert.strictEqual(oMarker.getAdditionalInfo(), "by John Doe", "Previously set additional info should be retrieved");
	});

	QUnit.test("Rendering", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			additionalInfo: "by John Doe"
		}).placeAt("qunit-fixture");
		oCore.applyChanges();

		var sExpectedText = oRB.getText('OM_LOCKED');

		// Assert
		assert.strictEqual(oMarker.$().children().length, 0, "There should be nothing rendered without a type applied");

		// Act
		oMarker.setType(ObjectMarkerType.Locked);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oMarker.$().children().length, 1, "There rendered content when type is applied");
		assert.strictEqual(oMarker.$().text(), sExpectedText + " by John Doe", "The rendered text in the element should " +
				"include the text representation of the status set concatenated with the additional info");
	});

	QUnit.test("Rendering when the type is LockedBy", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.LockedBy,
			additionalInfo: "John Doe"
		}).placeAt("qunit-fixture");

		var sExpectedText = oRB.getText('OM_LOCKED_BY', ["John Doe"]);

		oCore.applyChanges();


		// Assert
		assert.strictEqual(oMarker.$().text(), sExpectedText, "The rendered text in the element should be get from the message bundle and the additional info passed as a parameter");
	});

	QUnit.test("Rendering when the type is LockedBy but no additionalInfo is provided", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.LockedBy
		}).placeAt("qunit-fixture");

		var sExpectedText = oRB.getText('OM_LOCKED_BY_ANOTHER_USER');

		oCore.applyChanges();


		// Assert
		assert.strictEqual(oMarker.$().text(), sExpectedText, "The rendered text in the element should be 'Locked by another user' taken from messagebundle");
	});

	QUnit.test("Rendering when the type is UnsavedBy", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.UnsavedBy,
			additionalInfo: "John Doe"
		}).placeAt("qunit-fixture");

		var sExpectedText = oRB.getText('OM_UNSAVED_BY', ["John Doe"]);

		oCore.applyChanges();


		// Assert
		assert.strictEqual(oMarker.$().text(), sExpectedText, "The rendered text in the element should be get from the message bundle and the additional info passed as a parameter");
	});

	QUnit.test("Rendering when the type is UnsavedBy but no additionalInfo is provided", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
			type: ObjectMarkerType.UnsavedBy
		}).placeAt("qunit-fixture");

		var sExpectedText = oRB.getText('OM_UNSAVED_BY_ANOTHER_USER');

		oCore.applyChanges();


		// Assert
		assert.strictEqual(oMarker.$().text(), sExpectedText, "The rendered text in the element should be 'Unsaved by another user' taken from messagebundle");
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			this.marker = new ObjectMarker();
			this.marker.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.marker.destroy();
		}
	});

	QUnit.test("ariaLabelledBy, ariaDescribedBy are propagated to the internal control that has them defined", function(assert) {
		var sLabelId,
			aLabels;
		// act
		this.marker.addAriaLabelledBy("id");
		oCore.applyChanges();

		// assert
		assert.notOk(this.marker._getInnerControl(), "internal control's is not created");
		assert.equal(this.marker.getAriaLabelledBy().length, 1, "ObjectMarker save arialabelled");

		//act
		this.marker.removeAllAriaLabelledBy();

		// arrange
		this.marker.setType(ObjectMarkerType.Locked);
		this.marker.attachPress(function(e) {});
		oCore.applyChanges();

		// act
		this.marker.addAriaLabelledBy("id1");
		oCore.applyChanges();
		// assert
		assert.strictEqual(this.marker.getAriaLabelledBy().length, 1, "ariaLabelledBy has one id");
		assert.strictEqual(this.marker.getAriaLabelledBy()[0], "id1", "ariaLabelledBy has the right id");
		assert.strictEqual(this.marker._getInnerControl().getAriaLabelledBy().length, 1, "internal control's ariaLabelledBy has one id");
		assert.strictEqual(this.marker._getInnerControl().getAriaLabelledBy()[0], "id1", "internal control's ariaLabelledBy has the right id");

		// act
		this.marker.addAriaDescribedBy("id2");
		oCore.applyChanges();


		// assert
		assert.strictEqual(this.marker.getAriaDescribedBy().length, 1, "ariaDescribedBy has one id");
		assert.strictEqual(this.marker.getAriaDescribedBy()[0], "id2", "ariaDescribedBy has the right id");
		assert.strictEqual(this.marker._getInnerControl().getAriaDescribedBy().length, 1, "internal control's ariaDescribedBy has one id");
		assert.strictEqual(this.marker._getInnerControl().getAriaDescribedBy()[0], "id2", "internal control's ariaDescribedBy has the right id");

		// act
		sLabelId = this.marker.removeAriaLabelledBy("id1");
		oCore.applyChanges();

		// assert
		assert.strictEqual(sLabelId, "id1", "removeAriaLabelledBy returns the right id");
		assert.strictEqual(this.marker.getAriaLabelledBy().length, 0, "ariaLabelledBy has no ids");
		assert.strictEqual(this.marker._getInnerControl().getAriaLabelledBy().length, 0, "internal control's ariaLabelledBy has no ids");

		// act
		this.marker.addAriaLabelledBy("id3");
		this.marker.addAriaLabelledBy("id4");
		oCore.applyChanges();
		aLabels = this.marker.removeAllAriaLabelledBy();
		oCore.applyChanges();

		// assert
		assert.strictEqual(aLabels.length, 2, "removeAllAriaLabelledBy returns a list of ids");
		assert.strictEqual(aLabels[1], "id4", "removeAllAriaLabelledBy returns the right ids");
		assert.strictEqual(this.marker.getAriaLabelledBy().length, 0, "ariaLabelledBy has no ids");
		assert.strictEqual(this.marker._getInnerControl().getAriaLabelledBy().length, 0, "internal control's ariaLabelledBy has no ids");
	});

	QUnit.test("ariaLabelledBy, ariaDescribedBy are not set when the control has no 'type' set", function(assert) {
		// arrange
		this.marker.attachPress(function(e) {});

		// act
		this.marker.addAriaLabelledBy("id1");
		oCore.applyChanges();

		// assert
		assert.ok(this.marker.getAriaLabelledBy(), "ariaLabelledBy is save in ObjectMarker");
		assert.ok(!this.marker._getInnerControl(), "there is no innerControl");

		// act
		this.marker.addAriaDescribedBy("id2");
		oCore.applyChanges();

		// assert
		assert.ok(this.marker.getAriaDescribedBy(), "ariaDescribedBy is save in ObjectMarker");
	});

	QUnit.test("ariaLabelledBy, ariaDescribedBy are not set when the internal control has not defined them", function(assert) {
		// arrange
		this.marker.setType(ObjectMarkerType.Locked);

		// act
		this.marker.addAriaLabelledBy("id1");
		oCore.applyChanges();

		// assert
		assert.ok(this.marker.getAriaLabelledBy(), "AriaLabelledBy is save");
		assert.ok(!this.marker._getInnerControl().getAriaLabelledBy, "there is no getAriaLabelledBy in the internal Control");

		// act
		this.marker.addAriaDescribedBy("id2");

		// assert
		assert.ok(this.marker.getAriaDescribedBy(), "AriaDescribedBy is save in ObjectMarker");
	});

	QUnit.test("getAccessibilityInfo is propagated to the internal control", function(assert) {
		var oResult,
			oExpected;

		// arrange
		this.marker.setType(ObjectMarkerType.Locked);
		this.marker.attachPress(function(e) {});
		oResult = this.marker.getAccessibilityInfo();
		oExpected = this.marker._getInnerControl().getAccessibilityInfo();

		// assert
		assert.strictEqual(oResult.role, oExpected.role, "acc info.role is the same as in the internal control");
		assert.strictEqual(oResult.focusable, oExpected.focusable, "acc info.focusable is the same as in the internal control");
		assert.strictEqual(oResult.enabled, oExpected.enabled, "acc info.enabled is the same as in the internal control");
	});

	QUnit.test("tabindex=0 for ObjectMarker of 'Favorite' type", function (assert) {
		// Act
		this.marker.setType(ObjectMarkerType.Favorite);
		this.marker.attachPress(function () {}); // Make ObjectMarker interactive
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.marker._getInnerControl()._getIconAggregation().$().attr("tabindex"), "0", "tabindex is set to '0'");
	});

	QUnit.test("tabindex=0 for ObjectMarker of 'Flagged' type", function (assert) {
		// Act
		this.marker.setType(ObjectMarkerType.Flagged);
		this.marker.attachPress(function () {}); // Make ObjectMarker interactive
		oCore.applyChanges();

		// Assert
		assert.strictEqual(this.marker._getInnerControl()._getIconAggregation().$().attr("tabindex"), "0", "tabindex is set to '0'");
	});

	QUnit.test("Icon changing its decorative state", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
				type: ObjectMarkerType.Locked
			}),
			oIcon = oMarker._getInnerControl()._getIconAggregation();

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oCore.applyChanges();

		// Assert
		assert.ok(oIcon.getDecorative(), "Icon should be decorative if there's additional text");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);
		oCore.applyChanges();

		// Assert
		assert.notOk(oIcon.getDecorative(), "Icon shouldn't be decorative if there's no additional text");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oCore.applyChanges();

		// Assert
		assert.ok(oIcon.getDecorative(), "Icon is back to being decorative");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("aria-label of the icon - IconOnly", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
				visibility: ObjectMarkerVisibility.IconOnly
			}),
			oIcon,
			sType;

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		for (sType in ObjectMarkerType) {
			// Act
			oMarker.setType(sType);
			oIcon = oMarker._getInnerControl()._getIconAggregation();
			oCore.applyChanges();

			// Assert
			assert.ok(oIcon.getAlt(), "aria-label is correct for type " + sType);
		}

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("aria-label of the icon - IconAndText", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
				visibility: ObjectMarkerVisibility.IconAndText
			}),
			oIcon,
			sType;

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		for (sType in ObjectMarkerType) {
			// Act
			oMarker.setType(sType);
			oIcon = oMarker._getInnerControl()._getIconAggregation();
			oCore.applyChanges();

			// Assert
			assert.strictEqual(oIcon.getDomRef().getAttribute("aria-label"), oMarker._getMarkerText(ObjectMarker.M_PREDEFINED_TYPES[sType], sType, ""), "aria-label is correct for type " + sType);
		}

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("aria-label of the active icon - IconAndText", function (assert) {
		// Arrange
		var oLabel = new Label("labelInTable", {
				text : "Object Marker (active)"
			}),
			oMarker = new ObjectMarker("OM", {
				visibility: ObjectMarkerVisibility.IconAndText,
				press: function () {}
			}).addAriaLabelledBy(oLabel),
			sType;

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		for (sType in ObjectMarkerType) {
			// Act
			oMarker.setType(sType);
			oCore.applyChanges();

			// Assert
			assert.strictEqual(oMarker.getDomRef().querySelectorAll("#OM-link")[0].getAttribute("aria-labelledby"), "labelInTable OM-link", "aria-labelledby is correct for type " + sType);
		}

		// Cleanup
		oMarker.destroy();
		oLabel.destroy();
	});

	QUnit.test("Tooltips appearance", function (assert) {
		// Arrange
		var oMarker = new ObjectMarker({
				type: ObjectMarkerType.Locked
			}),
			oInnerControl = oMarker._getInnerControl();

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oCore.applyChanges();

		// Assert
		assert.notOk(oInnerControl.getTooltip(), "The tooltip of the inner control must not exist if the ObjectMarker has icon and text");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);
		oCore.applyChanges();

		// Assert
		assert.ok(oInnerControl.getTooltip(), "The tooltip of the inner control must exist if the ObjectMarker has icon only");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.TextOnly);
		oCore.applyChanges();

		// Assert
		assert.notOk(oInnerControl.getTooltip(), "The tooltip of the inner control must not exist if the ObjectMarker has text only");

		// Cleanup
		oMarker.destroy();
	});

	QUnit.test("Setting custom tooltips", function (assert) {
		// Arrange
		var sCustomTooltip = "CUSTOM",
			oMarker = new ObjectMarker({
				type: ObjectMarkerType.Locked,
				tooltip: sCustomTooltip
			}),
			oInnerControl = oMarker._getInnerControl(),
			oInnerIcon;

		oMarker.placeAt("qunit-fixture");
		oCore.applyChanges();

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oCore.applyChanges();
		oInnerIcon = oInnerControl._getIconAggregation();

		// Assert
		assert.notOk(oInnerIcon.getTooltip(), "Inner control's icon tooltip of non-interactive ObjectMarker with IconAndText visibility doesn't exist");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);
		oCore.applyChanges();

		// Assert
		assert.notOk(oInnerIcon.getTooltip(), "Inner control's icon tooltip of non-interactive ObjectMarker with IconOnly visibility doesn't exist");

		// Act; Attaching press converts ObjectMarker to interactive
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oMarker.attachPress(function() {});
		oInnerControl = oMarker._getInnerControl();
		oInnerIcon = oInnerControl._getIconAggregation();
		oCore.applyChanges();

		// Assert
		assert.notOk(oInnerIcon.getTooltip(), "Inner control's icon tooltip of interactive ObjectMarker with IconAndText visibility doesn't exist");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oInnerIcon.getTooltip(), sCustomTooltip, "Inner control's icon tooltip of interactive ObjectMarker with IconOnly visibility is set to custom-set tooltip");

		// Act; remove custom tooltip
		oMarker.setTooltip("");
		oMarker.setVisibility(ObjectMarkerVisibility.IconAndText);
		oCore.applyChanges();

		// Assert
		assert.notOk(oInnerIcon.getTooltip(), "Inner control's icon tooltip of interactive ObjectMarker with IconAndText visibility doesn't exist");

		// Act
		oMarker.setVisibility(ObjectMarkerVisibility.IconOnly);
		oCore.applyChanges();

		// Assert
		assert.strictEqual(oInnerIcon.getTooltip(), "Locked", "Inner control's icon tooltip of interactive ObjectMarker with IconOnly visibility is set to default one");

		// Cleanup
		oMarker.destroy();
	});


});