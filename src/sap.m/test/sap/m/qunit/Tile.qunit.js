/*global QUnit */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/core/Lib",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Tile",
	"sap/m/TileContainer",
	"sap/m/library",
	"sap/ui/core/InvisibleText",
	"sap/ui/events/KeyCodes",
	"sap/ui/core/Core"
], function(Element, Library, qutils, Tile, TileContainer, mobileLibrary, InvisibleText, KeyCodes, core) {
	"use strict";

	QUnit.module("Dimensions");


	QUnit.test("ShouldRoundDimensionsToFloor", function(assert) {
		// SUT
		var sut = new Tile();

		// Act
		sut.setPos(1.8,2.4);

		// Assert
		assert.equal(sut._posX,1);
		assert.equal(sut._posY,2);
	});

	QUnit.test("Position is not set, when the tile is not shown in parents container", function(assert) {
		// SUT
		var sut = new Tile({visible: false});
		sut._rendered = true;

		// Act
		sut.setPos(1.8,2.4);

		// Assert
		assert.ok(true, "The tile doesn't throw an error");
	});

	QUnit.test("ShouldSetStyledForPosition", function(assert) {
		var done = assert.async();
		// Arrange
		var sut, $sut,
			xPosition = 5,
			yPosition = 8;


		// SUT
		sut = new Tile();

		sut.placeAt("qunit-fixture");
		core.applyChanges();

		// Act
		sut.setPos(xPosition,yPosition);
		core.applyChanges();
		$sut = sut.$();

		setTimeout(function(){

			var result = $sut.css("transform") || $sut.css("-webkit-transform") || $sut.css("msTransform") || $sut.css("MozTransform");

			// Assert
			if (result.indexOf('matrix3d') == 0) {
				assert.equal(result,"matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, " + xPosition + ", " + yPosition + ", 0, 1)" );
							} else {
				assert.equal(result,"matrix(1, 0, 0, 1, " + xPosition + ", " + yPosition + ")" );
			}
			done();
		},800);
	});

	QUnit.test("ShouldSetTheSize", function(assert) {
		// Arrange
		var sut,
			width = 3,
			height = 4;

		// SUT
		sut = new Tile();

		// Act
		sut.setSize(width,height);

		// Assert
		assert.equal(sut._width,width);
		assert.equal(sut._height,height);
	});


	QUnit.module("Properties");


	QUnit.test("ShouldSetRemoveable", function(assert) {
		// SUT
		var sut = new Tile();

		// ACT
		sut.isEditable(false);

		// Assert
		assert.equal(sut._bIsEditable,false);
	});


	QUnit.test("ShouldSetIfATileIsDragged", function(assert) {
			// SUT
			var sut = new Tile();
			sut.isEditable(true);
			sut.placeAt("qunit-fixture");

			core.applyChanges();

			// Act
			sut.isDragged(true);

			// Assert

			assert.ok(sut.$().hasClass("sapMTileDrag"),"has drag class set");
	});


	QUnit.test("Should Set Visibility and trigger rerender of the TileContainer", function(assert) {
		//Arrange
		//SUT
		var sut = new Tile(),
		sut2 = new Tile(),
		container = new TileContainer({tiles: [sut, sut2]});

		this.spy(container, "invalidate");

		container.placeAt("qunit-fixture");
		core.applyChanges();

		//Act
		sut.setVisible(false);
		core.applyChanges();

		//Assert
		assert.ok(container.invalidate.calledOnce, "Tile container is invalidated when tile visibility is changed");
		container.destroy();
	});



	QUnit.module("Events");

	QUnit.test("ShouldReactOnTouchstart", function(assert) {
		// SUT
		var sut = new Tile();
		sut.placeAt("qunit-fixture");

		core.applyChanges();

		// Act
		qutils.triggerTouchEvent("touchstart",sut.getDomRef(),{clientX: 0, clientY: 0});

		// Assert
		assert.ok(sut.$().hasClass("sapMTileActive"));
		assert.ok(sut.$().hasClass("sapMTileActive-CTX"));
	});

	QUnit.test("ShouldReactOnTouchEnd", function(assert) {
		//SUT
		var sut = new Tile();
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		sut.$().toggleClass("sapMTileActive",true);
		sut.$().toggleClass("sapMTileActive-CTX",true);

		//Act
		qutils.triggerTouchEvent("touchend",sut.getDomRef());

		//Assert
		assert.ok(!sut.$().hasClass("sapMTileActive"));
		assert.ok(!sut.$().hasClass("sapMTileActive-CTX"));

	});

	QUnit.test("ShouldReactOnTouchMove", function(assert) {
		//SUT
		var sut = new Tile();
		sut.placeAt("qunit-fixture");
		core.applyChanges();

		qutils.triggerTouchEvent("touchstart",sut.getDomRef(), {clientX: 0, clientY: 0});

		//Act
		qutils.triggerTouchEvent("touchmove",sut.getDomRef(), {clientX: 100, clientY: 100});

		//Assert
		assert.ok(!sut.$().hasClass("sapMTileActive"));
		assert.ok(!sut.$().hasClass("sapMTileActive-CTX"));

	});

	QUnit.test("ShouldPreventTapEventForChildren", function(assert) {
		//Arrange
		var result ,

		//SUT
			sut = new Tile(),

			container = new TileContainer({tiles: [sut]});

		container._bAvoidChildTapEvent = true;
		container.placeAt("qunit-fixture");
		core.applyChanges();

		//Act
		result = sut._parentPreventsTapEvent;
		try {
			sut._parentPreventsTapEvent = 5;
		} catch (err) {
			assert.ok(true, "strict mode code is not allowed to write a read-only property");
		}

		//Assert
		assert.equal(result,true);
		assert.equal(result,sut._parentPreventsTapEvent);
		container.destroy();
	});

	QUnit.module("Keyboard handling");

	QUnit.test("ShouldFirePressOnEnterOrSpace", function(assert) {
		//Arrange
		var result = 0,
		//SUT
		sut = new Tile({ press: handleTilePress });

		function handleTilePress() {
			result++;
		}

		sut.placeAt("qunit-fixture");
		core.applyChanges();

		//Act
		qutils.triggerKeydown(sut.getDomRef(), KeyCodes.ENTER);
		//Assert
		assert.equal(result, 1);

		//Act
		qutils.triggerKeydown(sut.getDomRef(), KeyCodes.SPACE);
		//Assert
		assert.equal(result, 2);
	});

	QUnit.test('ShouldHaveAccessibilityAttributes', function (assert) {
		// SUT
		var sut = new Tile(),
			tiles = [sut, new Tile()],
			cnt = new TileContainer({tiles: tiles}),
			sRoleDescr = Library.getResourceBundleFor("sap.m").getText("TILE_ROLE_DESCRIPTION");

		cnt.placeAt("qunit-fixture");

		// Act
		core.applyChanges();

		// Assert
		assert.equal(sut.$().attr('role'), 'option', 'option, option; equal success');
		assert.equal(sut.$().attr('aria-roledescription'), sRoleDescr, 'Proper custom semantics applied');
		assert.equal(sut.$().attr('aria-posinset'), "1", 'position in the set must equal to 1');
		assert.equal(sut.$().attr('aria-setsize'), "2", 'the size of the set must equal to 2');

		cnt.destroy();
	});

	QUnit.test("ShouldHaveAriaDescribedByAttribute", function (assert) {
		var sut 	= new Tile(),
			tiles	= [sut, new Tile()],
			cnt		= new TileContainer({tiles: tiles});

		cnt.placeAt("qunit-fixture");

		// Act
		core.applyChanges();

		// Assert
		assert.equal(sut.$().attr('aria-describedby'), null, 'When tile is not editable, aria-describedby should not exist');

		// Act
		sut.isEditable(true);
		//Assert
		assert.equal(sut.$().attr('aria-describedby'), InvisibleText.getStaticId("sap.m", "TILE_REMOVE_BY_DEL_KEY"), 'When tile is editable, aria-describedby should exist');
		assert.equal(Element.getElementById(InvisibleText.getStaticId("sap.m", "TILE_REMOVE_BY_DEL_KEY")).getText(),
				Library.getResourceBundleFor("sap.m").getText("TILE_REMOVE_BY_DEL_KEY"),
				'When tile is editable, aria-describedby should point to a label with certain text');

		cnt.destroy();
	});
});