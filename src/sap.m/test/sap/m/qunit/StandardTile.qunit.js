/*global QUnit */
sap.ui.define([
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/StandardTile",
	"sap/ui/core/IconPool",
	"sap/m/TileContainer",
	"jquery.sap.global",
	"sap/ui/Device"
], function(
	createAndAppendDiv,
	StandardTile,
	IconPool,
	TileContainer,
	jQuery,
	Device
) {
	"use strict";

	// prepare DOM
	createAndAppendDiv("tiles");


	var IMAGE_PATH = "test-resources/sap/m/images/";

	var tileBasic, tileNoIcon, tileNoNumber, tileIconFont;

	var tileBasicId = "tileBasic",
		tileNoIconId = "tileNoIcon",
		tileNoNumberId = "tileNoNumber",
		tileIconFontId = "tileIconFont",
		core = sap.ui.getCore(),
		pressedTileId;

	function handlePress(oEvent) {
		pressedTileId = oEvent.oSource.getId();
	}

	tileBasic = new StandardTile(tileBasicId, {
		icon : IMAGE_PATH + "action.png",
		number : 37,
		numberUnit : "EUR",
		title : "Lorem ipsum dolor",
		info : "1 day ago",
		press : handlePress
	});

	tileNoIcon = new StandardTile(tileNoIconId, {
		number : 12,
		numberUnit : "EUR",
		title : "Lorem ipsum dolor",
		info : "1 day ago"
	});

	tileNoNumber = new StandardTile(tileNoNumberId, {
		icon : IMAGE_PATH + "action.png",
		title : "Lorem ipsum dolor",
		info : "1 day ago"
	});

	tileIconFont = new StandardTile(tileIconFontId, {
		icon : IconPool.getIconURI("inbox"),
		number : 37,
		numberUnit : "EUR",
		title : "Using icon font"
	});

	var tilesList = [];
	tilesList.push(tileBasic);
	tilesList.push(tileNoIcon);
	tilesList.push(tileNoNumber);
	tilesList.push(tileIconFont);

	var tc = new TileContainer("tc",{
		tiles : tilesList
	});

	tc.placeAt("tiles");

	QUnit.module("Rendering All Fields");

	QUnit.test("ControlRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId), null, "tileBasic should be rendered.");
	});

	QUnit.test("IconRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId + "-img"), null, "tileBasic icon should be rendered.");
	});

	QUnit.test("IconFontRendered", function(assert) {
		assert.equal(jQuery.sap.domById(tileIconFont + "-img"), null, "tileIconFont icon should be rendered.");
	});

	QUnit.test("NumberRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId + "-number"), null, "tileBasic number should be rendered.");
	});

	QUnit.test("NumberUnitRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId + "-numberUnit"), null, "tileBasic number unit should be rendered.");
	});

	QUnit.test("TitleRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId + "-title"), null, "tileBasic title should be rendered.");
	});

	QUnit.test("DescriptionRendered", function(assert) {
		assert.notEqual(jQuery.sap.domById(tileBasicId + "-info"), null, "tileBasic info should be rendered.");
	});

	QUnit.test("ShouldRenderAddIconIfTypeIsCreate", function(assert) {
		//SUT
		var result,
			sut = new StandardTile({type: "Create"});

		//Act
		result = sut.getIcon();

		//Assert
		assert.ok(result,"result should not be undefined");
		assert.ok(result.indexOf("add") !== -1, result,"result should contain add");


		sut.destroy();
	});

	QUnit.test("ShouldStyleLongNumbersDifferently", function(assert) {
		//SUT
		var sut = new StandardTile({type: "Monitor", number:"4000", icon : IMAGE_PATH + "action.png"}),
				result;
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		//Act
		result = jQuery(sut.getDomRef()).find(".sapMStdTileNumS .sapMStdTileNumM");
		//Assert
		assert.equal(result.length, 0);

		//Act
		sut.setNumber("7000000");
		core.applyChanges();
		result = jQuery(sut.getDomRef()).find(".sapMStdTileNumM");
		//Assert
		assert.equal(result.length, 1);

		//Act
		sut.setNumber("80000000");
		core.applyChanges();
		result = jQuery(sut.getDomRef()).find(".sapMStdTileNumS");
		//Assert
		assert.equal(result.length, 1);

		sut.destroy();
	});



	QUnit.module("Not Rendering Optional Fields");

	QUnit.test("IconNotRendered", function(assert) {
		assert.equal(jQuery.sap.domById(tileNoIconId + "-img"), null, "tileNoIcon icon should not be rendered.");
	});

	QUnit.test("NumberNotRendered", function(assert) {
		assert.equal(jQuery.sap.domById(tileNoNumberId + "-number"), null, "tileNoNumber number and number units should not be rendered.");
	});


	QUnit.module("Events", {
		beforeEach : function() {
			tileBasic = sap.ui.getCore().getControl(tileBasicId);
		},
		afterEach : function() {
			tileBasic = null;
		}
	});

	QUnit.test("PressOk", function(assert) {
		tileBasic.firePress();
		jQuery.sap.log.info("Pressed tile id=" + pressedTileId);
		assert.equal(pressedTileId, tileBasicId, "tileBasic was pressed");
	});

	QUnit.test("ontap will set the focus to the StandardTile domRef in IE", function (assert) {
		// Arrange
		var oStandardTile = new StandardTile(),
			bSpyDestroyHandler = this.spy(oStandardTile, "focus"),
			oBrowserStub = this.stub(Device, "browser").value({ msie: true });

		// Act
		oStandardTile.ontap();

		// Assert
		assert.equal(bSpyDestroyHandler.callCount, 1, "StandardTile is focused");

		// Cleanup
		oStandardTile.destroy();
		oBrowserStub.restore();
	});

	QUnit.test("ShouldDestroyTheImageIfTileGetsDestroyed", function(assert) {
		//SUT
		var sut = new StandardTile({type: "Create"});
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		assert.ok(sut._oImageControl, "make sure the Tile has an image");

		//Act
		sut.destroy();

		//Assert
		assert.equal(sut._oImageControl,null);
	});
});