/*global QUnit */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/StandardTile",
	"sap/ui/core/IconPool",
	"sap/m/TileContainer",
	"sap/ui/core/Core"
], function(
	Log,
	createAndAppendDiv,
	StandardTile,
	IconPool,
	TileContainer,
	oCore
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
		assert.notEqual(document.getElementById(tileBasicId), null, "tileBasic should be rendered.");
	});

	QUnit.test("IconRendered", function(assert) {
		assert.notEqual(document.getElementById(tileBasicId + "-img"), null, "tileBasic icon should be rendered.");
	});

	QUnit.test("IconFontRendered", function(assert) {
		assert.equal(document.getElementById(tileIconFont + "-img"), null, "tileIconFont icon should be rendered.");
	});

	QUnit.test("NumberRendered", function(assert) {
		assert.notEqual(document.getElementById(tileBasicId + "-number"), null, "tileBasic number should be rendered.");
	});

	QUnit.test("NumberUnitRendered", function(assert) {
		assert.notEqual(document.getElementById(tileBasicId + "-numberUnit"), null, "tileBasic number unit should be rendered.");
	});

	QUnit.test("TitleRendered", function(assert) {
		assert.notEqual(document.getElementById(tileBasicId + "-title"), null, "tileBasic title should be rendered.");
	});

	QUnit.test("DescriptionRendered", function(assert) {
		assert.notEqual(document.getElementById(tileBasicId + "-info"), null, "tileBasic info should be rendered.");
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
		result = sut.$().find(".sapMStdTileNumS .sapMStdTileNumM");
		//Assert
		assert.equal(result.length, 0);

		//Act
		sut.setNumber("7000000");
		core.applyChanges();
		result = sut.$().find(".sapMStdTileNumM");
		//Assert
		assert.equal(result.length, 1);

		//Act
		sut.setNumber("80000000");
		core.applyChanges();
		result = sut.$().find(".sapMStdTileNumS");
		//Assert
		assert.equal(result.length, 1);

		sut.destroy();
	});



	QUnit.module("Not Rendering Optional Fields");

	QUnit.test("IconNotRendered", function(assert) {
		assert.equal(document.getElementById(tileNoIconId + "-img"), null, "tileNoIcon icon should not be rendered.");
	});

	QUnit.test("NumberNotRendered", function(assert) {
		assert.equal(document.getElementById(tileNoNumberId + "-number"), null, "tileNoNumber number and number units should not be rendered.");
	});


	QUnit.module("Events", {
		beforeEach : function() {
			tileBasic = oCore.byId(tileBasicId);
		},
		afterEach : function() {
			tileBasic = null;
		}
	});

	QUnit.test("PressOk", function(assert) {
		tileBasic.firePress();
		Log.info("Pressed tile id=" + pressedTileId);
		assert.equal(pressedTileId, tileBasicId, "tileBasic was pressed");
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