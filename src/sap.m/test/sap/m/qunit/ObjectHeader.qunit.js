/*global QUnit */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/IconPool",
	"sap/m/ObjectAttribute",
	"sap/m/ObjectStatus",
	"sap/ui/core/library",
	"sap/m/ProgressIndicator",
	"sap/ui/core/Item",
	"sap/m/ObjectHeader",
	"sap/m/library",
	"jquery.sap.global",
	"sap/m/ObjectNumber",
	"sap/m/ObjectMarker",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	IconPool,
	ObjectAttribute,
	ObjectStatus,
	coreLibrary,
	ProgressIndicator,
	Item,
	ObjectHeader,
	mobileLibrary,
	jQuery,
	ObjectNumber,
	ObjectMarker
) {
	// shortcut for sap.m.ObjectMarkerType
	var ObjectMarkerType = mobileLibrary.ObjectMarkerType;

	// shortcut for sap.ui.core.TitleLevel
	var TitleLevel = coreLibrary.TitleLevel;

	// shortcut for sap.m.BackgroundDesign
	var BackgroundDesign = mobileLibrary.BackgroundDesign;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

	createAndAppendDiv("objectHeaders");
	createAndAppendDiv("destroy-oh");
	createAndAppendDiv("flagAndFavorite-oh");
	createAndAppendDiv("titleArrowOH-oh");



	var domRef = null;
	var eventHandler = function(oEvent) {

		domRef = oEvent.getParameters().domRef;
	};

	var ohBasicId = "ohBasic";

	var attrs1 = [ new ObjectAttribute("oa1", {
		text : "Contract #D1234567890"
	}), new ObjectAttribute("oa2", {
		text : "Created by John Doe",
		active : true
	}) ];

	var statuses1 = [ new ObjectStatus("oses1", {
		text : "Statuses 1",
		state : ValueState.Success
	}), new ObjectStatus("oses2", {
		text : "Statuses 2",
		state : ValueState.Success
	}), new ObjectAttribute("oattr1", {
		text : "Should not be displayed"
	}), new ProgressIndicator(ohBasicId + "-pi", {
		visible : true,
		enabled : true,
		state : ValueState.NEUTRAL,
		displayValue : '80%',
		percentValue : 80,
		showValue : true,
		width : '100%',
		height : '1.375rem'
	}) ];

	var oItem0 = new Item({
		key : "0",
		text : "item 0",
		enabled : true
	});

	var oItem1 = new Item({
		key : "1",
		text : "item 1",
		enabled : true
	});

	var oItem2 = new Item({
		key : "2",
		text : "item 2",
		enabled : true
	});

	var oItem3 = new Item({
		key : "3",
		text : "item 3",
		enabled : true
	});

	var oItem4 = new Item({
		key : "4",
		text : "item 4",
		enabled : true
	});

	//test popover title
	var oTitleArrowDomRef = null;
	var oTitleArrowEventHandler = function(oEvent) {

		oTitleArrowDomRef = oEvent.getParameters().domRef;
	};

	var ohBasic = new ObjectHeader(ohBasicId, {
		intro : "On behalf of John Smith",
		introPress : eventHandler,
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		titlePress : eventHandler,
		showTitleSelector : true,
		titleSelectorPress : oTitleArrowEventHandler,
		number : "3.624",
		numberUnit : "EUR",
		numberState : ValueState.Success,
		icon : IconPool.getIconURI("attachment"),
		iconPress : eventHandler,
		attributes : attrs1,
		statuses : statuses1,
		firstStatus : new ObjectStatus("os1", {
			text : "Ñgçy Positive Text Ñgçy",
			state : ValueState.Success
		}),
		secondStatus : new ObjectStatus("os2", {
			text : "Negative Text Ñgçy",
			state : ValueState.Error
		}),
		tooltip : "Test tooltip for the header",
		backgroundDesign : BackgroundDesign.Solid
	});
	ohBasic.placeAt("objectHeaders");

	var attrs2 = [ new ObjectAttribute({
		text : "It is great to flag objects!"
	}), new ObjectAttribute({
		text : "It is great to markFavorite objects!"
	}) ];

	var ohFlagFavId = "flag_fav";
	var ohFlagFav = new ObjectHeader({
		id : ohFlagFavId,
		intro : "Flag & Favorites",
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		number : "3.624",
		numberUnit : "EUR",
		numberState : ValueState.Success,
		icon : IconPool.getIconURI("attachment"),
		attributes : attrs2,
		firstStatus : new ObjectStatus({
			text : "Ñgçy Positive Text Ñgçy",
			state : ValueState.Success
		}),
		secondStatus : new ObjectStatus({
			text : "Negative Text Ñgçy",
			state : ValueState.Error
		}),
		markFavorite : true,
		markFlagged : true,
		showMarkers : true
	});
	ohFlagFav.placeAt("objectHeaders");

	var ohFlagFavId2 = "flag_fav2";
	var ohFlagFav2 = new ObjectHeader({
		id : ohFlagFavId2,
		intro : "Flag & Favorites",
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		number : "3.624",
		numberUnit : "EUR",
		numberState : ValueState.Error,
		icon : IconPool.getIconURI("attachment"),
		attributes : [ new ObjectAttribute({
			text : "It is great to flag objects!"
		}), new ObjectAttribute({
			text : "It is great to markFavorite objects!"
		}) ],
		firstStatus : new ObjectStatus({
			text : "Ñgçy Positive Text Ñgçy",
			state : ValueState.Success
		}),
		secondStatus : new ObjectStatus({
			text : "Negative Text Ñgçy",
			state : ValueState.Error
		})
	});
	ohFlagFav2.placeAt("objectHeaders");

	var ohAttributeAndFlagId2 = "ohAttributeAndFlag2";

	var ohAttributeAndFlag2 = new ObjectHeader(ohAttributeAndFlagId2, {
		title : "Object that is markFlagged with attribute",
		number : "3.628.000",
		numberUnit : "EUR",
		numberState : ValueState.Error,
		attributes : [ new ObjectAttribute(ohAttributeAndFlagId2 + "-attr1", {
			text : "Attribute number 1"
		}) ],
		markFlagged : true,
		showMarkers : true
	});
	ohAttributeAndFlag2.placeAt("objectHeaders");

	QUnit.module("Rendering All Fields");

	QUnit.test("ControlRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId), null, "ObjectHeader Basic should be rendered.");
	});

	QUnit.test("TooltipRendered", function(assert) {

		assert.equal(jQuery("#" + ohBasicId).attr("title"), "Test tooltip for the header", "Tooltip should be rendered.");
	});

	QUnit.test("IntroRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId + "-intro"), null, "Intro should be rendered.");
	});

	QUnit.test("TitleRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasic._titleText.getId()), null, "Title should be rendered.");
	});

	QUnit.test("TitleArrowRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId + "-titleArrow"), null, "Title Arrow Icon should be rendered.");
		assert.equal(jQuery.sap.byId(ohBasic._oTitleArrowIcon.getId()).css("cursor"), "pointer", "The title arrow should have pointer cursor.");
	});

	QUnit.test("Title rendered as active but it's not a link", function(assert) {
		assert.equal(ohe.$("title").attr("href"), undefined, "Title attribute href is not a link.");
	});

	QUnit.test("NumberRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId + "-number"), null, "Number should be rendered.");
		assert.ok(jQuery("#" + ohBasicId + "-number").hasClass("sapMObjectNumber"), "Number is sap.m.ObjectNumber");
	});

	QUnit.test("AttributesRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById("oa1"), null, "Object attribute #1 should be rendered.");
		assert.notEqual(jQuery.sap.domById("oa2"), null, "Object attribute #2 should be rendered.");
	});

	QUnit.test("Attribute rerendered after being empty", function(assert) {
		var oOA = new ObjectAttribute({text: "Test"});
		var oOH = new ObjectHeader({attributes: [oOA]});

		oOH.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oOH.invalidate();
		oOA.setText("");
		sap.ui.getCore().applyChanges();

		oOA.setText("rerendered");
		sap.ui.getCore().applyChanges();

		// assert
		assert.strictEqual(oOA.$("text").html(), "rerendered", "Attribute is rendered inside ObjectHeader");

		// cleanup
		oOH.destroy();
	});

	QUnit.test("StatusesRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById("oses1"), null, "Object statuses #1 should be rendered.");
		assert.notEqual(jQuery.sap.domById("oses2"), null, "Object statuses #2 should be rendered.");
		assert.equal(jQuery.sap.domById("oattr1"), null, "Object attribute should not be rendered.");
	});

	QUnit.test("InfoRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById("os1"), null, "First status should be rendered.");
		assert.notEqual(jQuery.sap.domById("os2"), null, "Second status info should be rendered.");
	});

	QUnit.test("FavoriteRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohFlagFavId + "-favorite"), null, "Favorite marker should be rendered.");
		assert.ok(jQuery.sap.byId(ohFlagFavId + "-favorite").hasClass("sapMObjectMarker"), "Favorite is sapMObjectMarker.");

		assert.equal(jQuery.sap.domById(ohFlagFavId2 + "-favorite"), null, "Favorite marker should not be rendered.");
	});

	QUnit.test("FlagRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohFlagFavId + "-flag"), null, "Flag marker should be rendered.");
		assert.ok(jQuery.sap.byId(ohFlagFavId + "-flag").hasClass("sapMObjectMarker"), "Flag is sapMObjectMarker.");

		assert.equal(jQuery.sap.domById(ohFlagFavId2 + "-flag"), null, "Flag marker should not be rendered.");

		// test flag rendering with one attribute
		assert.notEqual(jQuery.sap.byId(ohAttributeAndFlagId2 + "-flag"), null, "Flag marker should be rendered.");
		assert.ok(jQuery.sap.byId(ohAttributeAndFlagId2 + "-flag").hasClass("sapMObjectMarker"), "Flag is sapMObjectMarker.");

	});

	QUnit.test("Flag Rendering Position", function(assert) {

		assert.ok(Math.abs(jQuery.sap.byId(ohAttributeAndFlagId2 + "-attr1")[0].offsetTop - jQuery.sap.byId(ohAttributeAndFlagId2 + "-flag")[0].offsetTop) <= 1,
		"Attribute and flag should be rendered on the same row");
	});

	QUnit.test("ProgressIndicatorRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId + "-pi"), null, "Progress Indicator should be rendered.");
		assert.ok(!jQuery(jQuery("#ohBasic .sapMOHStatusFixedWidth")[4]).attr("style"), "Progress Indicator only use 35% width.");
		assert.equal(jQuery("#ohBasic .sapMOHStatusFixedWidth .sapMPI").css("float"), "right", "Progress Indicator is floating right");
	});

	QUnit.test("NumberStateColorRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohBasicId + "-number"), null, "Number should be rendered.");
		assert.ok(jQuery("#" + ohBasicId + "-number").hasClass("sapMObjectNumberStatusSuccess"), "Number color uses value state success color.");
	});

	QUnit.test("Placeholders for invisible attributes", function(assert) {
		var done = assert.async();

		var oH = new ObjectHeader({
			title : "Invisible attribute issue",
			attributes : [ new ObjectAttribute({
				text : "Invisible attribute",
				visible : false
			}) ]
		});
		oH.placeAt('objectHeaders');

		setTimeout(function() {

			assert.ok(jQuery('#' + oH.getId() + ' > .sapMOHBottomRow > .sapMOHAttrRow').length === 0, "The attribute row should not be rendered");
			oH.destroy();
			done();
		});
	});

	QUnit.test("Placeholders for invisible status", function(assert) {
		var done = assert.async();

		var oH = new ObjectHeader({
			title : "Invisible status issue",
			statuses : [ new ProgressIndicator({
				percentValue : 99,
				state : ValueState.Error,
				visible : false
			}) ]
		});
		oH.placeAt('objectHeaders');

		setTimeout(function() {

			assert.ok(jQuery('#' + oH.getId() + ' > .sapMOHBottomRow > .sapMOHAttrRow > .sapMOHStatusFixedWidth').length === 0, "The status should not be rendered");
			oH.destroy();
			done();
		});
	});

	QUnit.test("Placeholders for invisible attribute with visible status", function(assert) {
		var done = assert.async();

		var oH = new ObjectHeader({
			title : "Reserved space for invisible attribute issue",
			statuses : [new ObjectStatus({
				text : "Visible status",
				state : ValueState.Success,
				visible : true
			}) ],
			attributes : [
				new ObjectAttribute({
					text : "First invisible attribute",
					visible : false
				}),
				new ObjectAttribute({
					text : "First visible attribute",
					visible : true
				})	]
		});
		oH.placeAt('objectHeaders');

		setTimeout(function() {

			assert.ok(jQuery('#' + oH.getId() + ' > .sapMOHBottomRow > .sapMOHAttrRow').length === 1, "Invisible attribute should not cause new row.");
			oH.destroy();
			done();
		});
	});

	QUnit.test("Placeholders for invisible status with visible attribute", function(assert) {
		var done = assert.async();

		var oH = new ObjectHeader({
			title : "Reserved space for invisible status issue",
			statuses : [
				new ProgressIndicator({
				displayValue : '30%',
				percentValue : 30,
				state : ValueState.Error,
				visible : false
				}),
				new ProgressIndicator({
					displayValue : '90%',
					percentValue : 90,
					state : ValueState.Error,
					visible : true
				})],
			attributes : [
				new ObjectAttribute({
					text : "Visible attribute",
					visible : true
				})	]
		});
		oH.placeAt('objectHeaders');

		setTimeout(function() {

			assert.ok(jQuery('#' + oH.getId() + ' > .sapMOHBottomRow > .sapMOHAttrRow').length === 1, "Invisible status should not cause new row.");
			oH.destroy();
			done();
		});
	});

	/******************************************************************/

	QUnit.module("Rendering condensed Object Header");

	var ohCondensedId = "ohc1";
	var ohCondensed = new ObjectHeader(ohCondensedId, {
		title : "Condensed Object header with attribute, number and number unit",
		number : "3.628.000",
		numberUnit : "EUR",
		condensed : true,
		backgroundDesign : BackgroundDesign.Transparent,
		attributes : [ new ObjectAttribute({
			text : "This is the only attribute in the object header"
		}) ]
	});
	var ohCondensedId2 = "ohc2";
	var ohCondensed2 = new ObjectHeader(ohCondensedId2, {
		title : "Condensed Object header with solid background",
		number : "3.628.000",
		numberUnit : "EUR",
		condensed : true,
		attributes : [ new ObjectAttribute({
			text : "This is the only attribute in the object header"
		}) ]
	});

	ohCondensed.placeAt("objectHeaders");
	ohCondensed2.placeAt("objectHeaders");

	QUnit.test("Object Header has condensed style", function(assert) {

		assert.equal(jQuery("#ohc1.sapMOHC").length, 1, "Object Header with condensed style is rendered");
	});

	QUnit.test("Object Header attribute is displayed under title", function(assert) {

		assert.equal(jQuery("#ohc1.sapMOHC > .sapMOHAttr").length, 1, "Object Header attribute is displayed under title");
	});

	QUnit.test("NumberRendered", function(assert) {

		assert.notEqual(jQuery.sap.domById(ohCondensedId + "-number"), null, "Number should be rendered.");
		assert.ok(jQuery("#" + ohCondensedId + "-number").hasClass("sapMObjectNumber"), "Number is sap.m.ObjectNumber");
	});

	QUnit.test("Background is transparent", function(assert) {

		assert.equal(jQuery("#ohc1.sapMOHBgTransparent").length, 1, "Transparent background style should be set.");

		// in some browsers css("background-color") instead of "transparent" returns "rgba(0, 0, 0, 0)"
		var bBackgroundTransparent = (jQuery.sap.byId("ohc1").css("background-color") == "transparent") || (jQuery.sap.byId("ohc1").css("background-color") == "rgba(0, 0, 0, 0)");
		assert.ok(bBackgroundTransparent, "Background color is transparent");
	});

	QUnit.test("Background is solid", function(assert) {

		assert.equal(jQuery("#ohc2.sapMOHBgSolid").length, 1, "Solid background style should be set.");
	});

	/******************************************************************/

	QUnit.module("Internal API");

	var ohEmptyStatus1Id = "ohes1";
	var ohEmptyStatus2Id = "ohes2";
	var ohEmptyStatusesId = "ohess";
	var ohEmptyAttributesId = "oheattr";
	var ohEmptyAllId = "oheall";
	var ohFlagAndFavoriteMarkerId = "ohefafm";
	var ohOnlyProgressIndicatorId = "ohOnlyProgress";

	var ohAttributeAndFlagId = "ohAttributeAndFlag";
	var ohEmptyStatus1AndStatus2Id = "ohes1s2";

	var ohAttributeAndFlag = new ObjectHeader(ohAttributeAndFlagId, {
		title : "Object that is markFlagged with attribute",
		number : "3.628.000",
		numberUnit : "EUR",
		attributes : [ new ObjectAttribute({
			text : "Attribute number 1"
		}) ],
		markFlagged : true,
		showMarkers : true
	});

	var ohEmptyStatus1 = new ObjectHeader(ohEmptyStatus1Id, {
		title : "Header with empty second status",
		firstStatus : new ObjectStatus("ose1", {
			text : "\n  \n  \t",
			state : ValueState.Success
		})
	});
	var ohEmptyStatus2 = new ObjectHeader(ohEmptyStatus2Id, {
		title : "Header with empty first status",
		secondStatus : new ObjectStatus("ose2", {
			text : "\n  \n  \t",
			state : ValueState.Error
		})
	});
	var ohEmptyStatuses = new ObjectHeader(ohEmptyStatusesId, {
		title : "Header with empty statuses",
		firstStatus : new ObjectStatus("ose3", {
			text : "\n  \n  \t",
			state : ValueState.Success
		}),
		secondStatus : new ObjectStatus("ose4", {
			text : "\n  \n  \t",
			state : ValueState.Error
		})
	});

	var ohEmptyAttributes = new ObjectHeader(ohEmptyAttributesId, {
		title : "Header with empty attributes",

		attributes : [ new ObjectAttribute("oae1", {
			text : "\n  \n  \t"
		}), new ObjectAttribute("oae2", {
			text : "\n  \n  \t"
		}) ]
	});

	var ohEmptyAll = new ObjectHeader(ohEmptyAllId, {
		title : "Header with empty attributes and statuses",

		attributes : [ new ObjectAttribute("oae3", {
			text : "\n  \n  \t"
		}), new ObjectAttribute("oae4", {
			text : "\n  \n  \t"
		}) ],

		firstStatus : new ObjectStatus("ose5", {
			text : "\n  \n  \t",
			state : ValueState.Success
		}),
		secondStatus : new ObjectStatus("ose6", {
			text : "\n  \n  \t",
			state : ValueState.Error
		})
	});

	var ohEmptyStatus1AndStatus2 = new ObjectHeader(ohEmptyStatus1AndStatus2Id, {
		title : "Header with empty first and second status",
		firstStatus : new ObjectStatus("ose7", {
			text : "\n  \n  \t",
			state : ValueState.Error
		}),
		secondStatus : new ObjectStatus("ose8", {
			text : "\n  \n  \t",
			state : ValueState.Error
		}),
		statuses : [ new ObjectStatus({
			text : "Statuses 1",
			state : ValueState.Success
		}) ]
	});

	var ohOnlyProgressIndicator = new ObjectHeader(ohOnlyProgressIndicatorId, {
		title : "Test dynamic marker states",
		number : "3.628.000",
		numberUnit : "EUR",
		showMarkers : true,
		statuses : [ new ProgressIndicator({
			percentValue : 99,
			state : ValueState.Error
		}) ]
	});
	ohOnlyProgressIndicator.placeAt("flagAndFavorite-oh");

	QUnit.test("Attribute and Flag API", function(assert) {

		assert.ok(ohAttributeAndFlag._hasBottomContent(), "Object header has bottom content");
		assert.ok(ohAttributeAndFlag._hasAttributes(), "Object header has attributes");
		assert.ok(ohAttributeAndFlag.getMarkFlagged(), "Object header has flag marker");
	});

	QUnit.test("TestEmptyOH", function(assert) {

		assert.ok(!ohEmptyStatus1._hasStatus(), "Object header has no rendered statuses");
		assert.ok(!ohEmptyStatus2._hasStatus(), "Object header has no rendered statuses");
		assert.ok(!ohEmptyStatuses._hasStatus(), "Object header has no rendered statuses");

		assert.ok(!ohEmptyAttributes._hasAttributes(), "Object header has no rendered attributes");

		assert.ok(!ohEmptyAll._hasAttributes(), "Object header has no rendered attributes");
		assert.ok(!ohEmptyAll._hasStatus(), "Object header has no rendered statuses");
		assert.ok(!ohEmptyAll.getMarkFlagged(), "Object header has no flag marker");
		assert.ok(!ohEmptyAll.getMarkFavorite(), "Object header has no markFavorite marker");
		assert.ok(!ohEmptyAll._hasBottomContent(), "Object header has no bottom content");
	});

	QUnit.test("TestNonEmptyStatus", function(assert) {

		assert.ok(ohEmptyStatus1AndStatus2._hasStatus(), "Object header has rendered statuses");
		assert.ok(ohOnlyProgressIndicator._hasStatus(), "Object header has rendered statuses if ProgressIndicator is only present");
	});

	QUnit.test("Title gets all length when no number", function(assert) {
		// arrange
		var oObjectHeader = new ObjectHeader({
			title: "Full title test"
		});

		// system under test
		oObjectHeader.placeAt("objectHeaders");
		sap.ui.getCore().applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titlediv");

		assert.ok($objectHeader.hasClass("sapMOHTitleDivFull"), "title occupies the whole available space");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Title gets all length when no number in Condensed OH", function(assert) {
		// arrange
		var oObjectHeader = new ObjectHeader({
			title: "Full title test",
			condensed: true
		});

		// system under test
		oObjectHeader.placeAt("objectHeaders");
		sap.ui.getCore().applyChanges();

		// Assert
		var $objectHeader = oObjectHeader.$("titlediv");

		assert.ok($objectHeader.hasClass("sapMOHTitleDivFull"), "title occupies the whole available space");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("FlagMarkerSet", function(assert) {
		var ohFlagAndFavoriteMarker = new ObjectHeader(ohFlagAndFavoriteMarkerId, {
			title : "Test dynamic marker states",
			number : "3.628.000",
			numberUnit : "EUR",
			showMarkers : true
		});
		ohFlagAndFavoriteMarker.placeAt("flagAndFavorite-oh");
		sap.ui.getCore().applyChanges();

		ohFlagAndFavoriteMarker.setMarkFlagged(true);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#" + ohFlagAndFavoriteMarkerId + " .sapUiIcon").length, 1, "Only one marker should be rendered");
		assert.ok(jQuery.sap.byId(ohFlagAndFavoriteMarkerId + "-flag").hasClass("sapMObjectMarker"), "Flag is sapMObjectMarker");

		// cleanup
		ohFlagAndFavoriteMarker.destroy();
	});

	QUnit.test("FlagMarkerUnset", function(assert) {
		var ohFlagAndFavoriteMarker = new ObjectHeader(ohFlagAndFavoriteMarkerId, {
			title : "Test dynamic marker states",
			number : "3.628.000",
			numberUnit : "EUR",
			showMarkers : true
		});
		ohFlagAndFavoriteMarker.placeAt("flagAndFavorite-oh");
		sap.ui.getCore().applyChanges();

		ohFlagAndFavoriteMarker.setMarkFlagged(false);
		ohFlagAndFavoriteMarker.setMarkFavorite(false);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#" + ohFlagAndFavoriteMarkerId + " .sapUiIcon").length, 0, "No markers should be rendered");

		// cleanup
		ohFlagAndFavoriteMarker.destroy();
	});

	QUnit.test("FavoriteMarkerSet", function(assert) {
		var ohFlagAndFavoriteMarker = new ObjectHeader(ohFlagAndFavoriteMarkerId, {
			title : "Test dynamic marker states",
			number : "3.628.000",
			numberUnit : "EUR",
			showMarkers : true
		});
		ohFlagAndFavoriteMarker.placeAt("flagAndFavorite-oh");
		sap.ui.getCore().applyChanges();

		ohFlagAndFavoriteMarker.setMarkFlagged(false);
		ohFlagAndFavoriteMarker.setMarkFavorite(true);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#" + ohFlagAndFavoriteMarkerId + " .sapUiIcon").length, 1, "Only one marker should be rendered");
		assert.ok(jQuery.sap.byId(ohFlagAndFavoriteMarkerId + "-favorite").hasClass("sapMObjectMarker"), "Favorite is sapMObjectMarker.");

		// cleanup
		ohFlagAndFavoriteMarker.destroy();
	});

	QUnit.test("FavoriteMarkerNotSet", function(assert) {
		var ohFlagAndFavoriteMarker = new ObjectHeader(ohFlagAndFavoriteMarkerId, {
			title : "Test dynamic marker states",
			number : "3.628.000",
			numberUnit : "EUR",
			showMarkers : true
		});
		ohFlagAndFavoriteMarker.placeAt("flagAndFavorite-oh");
		sap.ui.getCore().applyChanges();

		ohFlagAndFavoriteMarker.setMarkFlagged(false);
		ohFlagAndFavoriteMarker.setMarkFavorite(false);
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#" + ohFlagAndFavoriteMarkerId + " .sapUiIcon").length, 0, "No markers should be rendered");

		// cleanup
		ohFlagAndFavoriteMarker.destroy();
	});

	QUnit.test("AttributeWithoutSupportMarker", function(assert) {
		var ohFlagAndFavoriteMarker = new ObjectHeader(ohFlagAndFavoriteMarkerId, {
			title : "Test dynamic marker states",
			number : "3.628.000",
			numberUnit : "EUR",
			showMarkers : true
		});
		ohFlagAndFavoriteMarker.placeAt("flagAndFavorite-oh");
		sap.ui.getCore().applyChanges();

		ohFlagAndFavoriteMarker.setShowMarkers(false);
		ohFlagAndFavoriteMarker.addAttribute(new ObjectAttribute("ohefafm1", {
			text : "My Test Attribute"
		}));
		sap.ui.getCore().applyChanges();

		assert.equal(jQuery("#" + ohFlagAndFavoriteMarkerId + " .sapUiIcon").length, 0, "No markers should be rendered");
		assert.notEqual(jQuery.sap.domById("ohefafm1"), null, "Attribute should be rendered.");

		// cleanup
		ohFlagAndFavoriteMarker.destroy();
	});

	/******************************************************************/

	var oheId = "ohe";

	var ohe = new ObjectHeader(oheId, {
		intro : "On behalf of John Smith",
		introActive : true,
		introPress : eventHandler,
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		titleActive : true,
		titlePress : eventHandler,
		icon : IconPool.getIconURI("attachment"),
		iconActive : true,
		iconPress : eventHandler
	});
	ohe.placeAt("objectHeaders");

	QUnit.module("Events");

	QUnit.test("Title is active", function(assert) {
		// Assert
		var $objectHeaderTitle = ohe.$("title");

		assert.ok($objectHeaderTitle.hasClass("sapMOHTitleActive"), "Title div has class \"sapMOHTitleActive\".");
	});


	QUnit.test("TestTitleTap", function(assert) {

		qutils.triggerEvent("tap", oheId + "-title");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, oheId + "-title", "Title should be clickable");
		domRef = null;

		qutils.triggerEvent("tap", oheId + "-titleText-inner");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, oheId + "-title", "When clicking inner text div event should return outer div as source");
		domRef = null;

		qutils.triggerEvent("tap", ohBasicId + "-title");
		assert.ok(domRef === null, ohBasicId + " Title should not be clickable");
		domRef = null;
	});

	QUnit.test("TestIntroTap", function(assert) {

		qutils.triggerEvent("tap", oheId + "-intro");
		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, oheId + "-intro", "Intro should be clickable");
		domRef = null;

		qutils.triggerEvent("tap", ohBasicId + "-intro");
		assert.ok(domRef === null, ohBasicId + " intro should not be clickable");
		domRef = null;
	});

	QUnit.test("TestIconTap", function(assert) {
		ohe._oImageControl.firePress();

		assert.ok(domRef, "domRef is set");
		assert.equal(domRef.id, oheId + "-img", "Icon should be clickable");
		domRef = null;

		ohBasic._oImageControl.firePress();
		assert.ok(domRef === null, ohBasicId + " icon should not be clickable");
		domRef = null;
	});

	QUnit.test("TestIcon pressing Space when responsive=true", function(assert) {
		//Prepare
		var ohResponsiveIcon = new ObjectHeader("ohResponsiveIcon", {
			title: "Some Title",
			icon : IconPool.getIconURI("attachment"),
			iconActive: true,
			responsive: true,
			iconPress: eventHandler
		});
		ohResponsiveIcon.placeAt('objectHeaders');
		sap.ui.getCore().applyChanges();

		//Act
		var $oImageControlRef = ohResponsiveIcon._oImageControl.$();
		$oImageControlRef.focus();
		sap.ui.test.qunit.triggerKeyup($oImageControlRef, jQuery.sap.KeyCodes.SPACE);

		//Assert
		assert.ok(domRef, "Icon should fire 'iconPress' event when object header is responsive");
		if (domRef) {
			assert.equal(domRef.id, ohResponsiveIcon.getId() + "-img", "Icon should fire 'iconPress' event when object header is responsive and the event's source is the image");
		}
		//CleanUp
		domRef = null;
		ohResponsiveIcon.destroy();
	});

	QUnit.test("TestTitleSelectorTap", function(assert) {

		qutils.triggerEvent("tap", ohBasicId + "-titleArrow");
		assert.ok(oTitleArrowDomRef, "oTitleArrowDomRef is set to titleArrow");
		assert.equal(oTitleArrowDomRef.id, ohBasicId + "-titleArrow", "Title Arrow should be clickable");
		oTitleArrowDomRef = null;
	});

	QUnit.test("TestTitleSelector pressing SPACE", function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oArrowOH = new ObjectHeader("arrowOH", {
			title : "Title Arrow test, pressing space key.",
			showTitleSelector : true,
			titleSelectorPress : oSpy
		});

		// System under test
		oArrowOH.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oArrow = jQuery("#arrowOH-titleArrow")[0];
		oArrow.focus(); // set focus on the arrow

		// Assert
		sap.ui.test.qunit.triggerKeyup(oArrow, jQuery.sap.KeyCodes.SPACE);
		assert.strictEqual(oSpy.callCount, 1, "SPACE is pressed, titleSelectorPress event was fired");

		// clean up
		oArrowOH.destroy();
	});

	QUnit.test("TestTitleSelector pressing ENTER", function(assert) {
		//Arrange
		var oSpy = this.spy();
		var oArrowOH = new ObjectHeader("arrowOH", {
			title : "Title Arrow test, pressing enter key.",
			showTitleSelector : true,
			titleSelectorPress : oSpy
		});

		// System under test
		oArrowOH.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		var oArrow = jQuery("#arrowOH-titleArrow")[0];
		oArrow.focus(); // set focus on the arrow

		// Assert
		sap.ui.test.qunit.triggerKeydown(oArrow, jQuery.sap.KeyCodes.ENTER);
		assert.strictEqual(oSpy.callCount, 1, "ENTER is pressed, titleSelectorPress event was fired");

		// clean up
		oArrowOH.destroy();
	});


	//***************************************************************************
	var oTitleArrowOH = new ObjectHeader("titleArrowOH", {
		title : "Title Arrow reset to false and should not be displayed.",
		number : "3.624",
		numberUnit : "EUR",
		showTitleSelector : true,
		titleSelectorPress : oTitleArrowEventHandler
	});

	oTitleArrowOH.placeAt("titleArrowOH-oh");

	QUnit.module("TitleArrow");

	QUnit.test("TestTitleArrowResetToFalse", function(assert) {
		var done = assert.async();

		oTitleArrowOH.setShowTitleSelector(false);

		setTimeout(function() {
			assert.equal(jQuery.sap.byId("titleArrowOH-titleArrow").length, 0, " The titleArrowOH showTitleSelector is set to false and is not rendered.");
			done();
		}, 100);

	});

	/******************************************************************/
	QUnit.module("OH Screen Reader support");

	QUnit.test("OH has aria-labelledby", function(assert){
		assert.ok(jQuery("#" + ohBasicId).attr("aria-labelledby"), "OH has attribute aria-labelledby");
	});

	QUnit.test("OH has attribute role=region", function(assert){
		assert.ok(jQuery("#" + ohBasicId).attr("role"), "OH has attribute role");
		assert.equal(jQuery("#" + ohBasicId).attr("role"), "region", "role is region");
	});

	QUnit.test("OH Condensed has aria-labelledby", function(assert){
		assert.ok(jQuery("#" + ohCondensedId).attr("aria-labelledby"), "OH condensed has attribute aria-labelledby");
	});

	QUnit.test("OH Condensed has attribute role=region", function(assert){
		assert.ok(jQuery("#" + ohCondensedId).attr("role"), "OH condensed has attribute role");
		assert.equal(jQuery("#" + ohCondensedId).attr("role"), "region", "role is region");
	});

	QUnit.test("Active title has aria attributes", function(assert){
		assert.ok(jQuery("#" + oheId + "-title").attr("aria-haspopup"), "ActiveTitle has attribute aria-haspopup");
		assert.equal(jQuery("#" + oheId + "-title").attr("role"), "link", "ActiveTitle has role=link");
	});

	QUnit.test("Active icon has aria attributes", function(assert){
		assert.equal(jQuery(".sapMOHIcon.sapMPointer .sapUiIcon.sapUiIconPointer").attr("role"), "button", "ActiveIcon has role=button");
	});

	QUnit.test("Title has level H1", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level"
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has the default titleLevel H1");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Title has level H3", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level",
				titleLevel: TitleLevel.H3
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h3" ), "Title has titleLevel H3");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Title level is set correctly", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level"
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oObjectHeader.setTitleLevel("H4");
		sap.ui.getCore().applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h4" ), "Title has titleLevel H4");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("When set to Auto title has level H1", function(assert){
		// Arrange
		var oObjectHeader = new ObjectHeader({
				title: "Test title level",
				titleLevel: TitleLevel.Auto
			});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var $sTitle = oObjectHeader.$("title");
		assert.ok($sTitle.find( "h1" ), "Title has titleLevel H1");

		// cleanup
		oObjectHeader.destroy();
	});

	/******************************************************************/

	var iconOH = new ObjectHeader("iconOH", {
		icon : IconPool.getIconURI("pdf-attachment"),
		intro : "On behalf of John Smith",
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		number : "3.624",
		numberUnit : "EUR",
		markFlagged : true,
		markFavorite : true,
		showMarkers : true
	});

	var imageOH = new ObjectHeader("imageOH", {
		icon : "../images/action.png",
		iconTooltip: "test tooltip",
		intro : "On behalf of John Smith",
		title : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis luctus, turpis vitae porttitor hendrerit, elit dui mollis neque, id suscipit lorem mi in sem.",
		number : "3.624",
		numberUnit : "EUR"
	});

	iconOH.placeAt("destroy-oh");
	imageOH.placeAt("destroy-oh");

	QUnit.module("Exiting");

	QUnit.test("TestIconExit", function(assert) {
		var $sImg = iconOH.$("img");
		assert.ok(!(iconOH === null), "iconOH is not null");
		assert.ok(sap.ui.getCore().byId("iconOH"), "Icon is found in UI5 Core");
		assert.ok(!$sImg.attr("title"), "Icon has no tooltip");
		assert.ok(sap.ui.getCore().byId("iconOH-flag"), "Flag icon is found in UI5 Core");
		assert.ok(sap.ui.getCore().byId("iconOH-favorite"), "Favorite icon is found in UI5 Core");
		iconOH.destroy();
		assert.ok(!sap.ui.getCore().byId("iconOH-flag"), "Flag icon is found in UI5 Core");
		assert.ok(!sap.ui.getCore().byId("iconOH-favorite"), "Favorite icon is found in UI5 Core");
	});

	QUnit.test("TestImageExit", function(assert) {
		var $sImg = imageOH.$("img");
		assert.ok(!(imageOH === null), "imageOH is not null");
		assert.ok(sap.ui.getCore().byId("imageOH"), "Image is found in UI5 Core");
		assert.equal($sImg.attr("title"), "test tooltip", "Image has tooltip");
		imageOH.destroy();
		assert.ok(!sap.ui.getCore().byId("imageOH"), "Image is removed from UI5 Core");
	});

	QUnit.test("Title selector icon size", function(assert) {
		// arrange
		var oObjectHeader = new ObjectHeader({
			showTitleSelector: true,
			condensed: false
		});

		// system under test
		ohFlagFav.placeAt("objectHeaders");
		sap.ui.getCore().applyChanges();

		// assert: default in constructor
		assert.strictEqual(oObjectHeader._oTitleArrowIcon.getSize(), "1.375rem", "for a standard object header the icon size is 1.375rem");

		// assert: setter false
		oObjectHeader.setCondensed(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oObjectHeader._oTitleArrowIcon.getSize(), "1.375rem", "for a standard object header the icon size is 1.375rem again");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.module("AdditionalNumbers aggregations rendering");

	QUnit.test("additionalNumbers should be rendered", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(oAdditionalNum.length, "One additional number is rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if no aggregation is set", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers",
			number: "3213",
			numberUnit: "EUR"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if the condensed property is set to true", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			condensed: true,
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumbers shouldn't be rendered if the responsive property is set to true", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			responsive: true,
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "Zero additionalNumbers are rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("additionalNumber should be rendered after insertAdditionalNumber", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});
		var oNum = new ObjectNumber({
			number: "2134",
			unit: "Conversion rate"
		});
		oObjectHeader.insertAdditionalNumber(oNum, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(oAdditionalNum.length, "One additional number is rendered.");
	});

	QUnit.test("additionalNumber should be removed: removeAdditionalNumber", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});
		var oNum = new ObjectNumber({
			number: "2134",
			unit: "Conversion rate"
		});
		oObjectHeader.insertAdditionalNumber(oNum, 0);

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 1), "One additional number is rendered.");

		oObjectHeader.removeAdditionalNumber(oNum);
		sap.ui.getCore().applyChanges();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "The additional number is removed.");
	});

	QUnit.test("additionalNumber should be removed: removeAllAdditionalNumbers", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "4344",
					unit: "Local currency"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 2), "Two additional numbers are rendered.");

		oObjectHeader.removeAllAdditionalNumbers();
		sap.ui.getCore().applyChanges();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "All additional numbers are removed.");
	});

	QUnit.test("removeAllAdditionalNumbers when no additional numbers at all", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "Test numbers"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		oObjectHeader.removeAllAdditionalNumbers();
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "No error is raised when executing removeAllAttributes");
	});

	QUnit.test("AdditionalNumbers should be destroyed: destroyAdditionalNumbers", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "4344",
					unit: "Local currency"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok((oAdditionalNum.length == 2), "Two additional numbers are rendered.");

		oObjectHeader.destroyAdditionalNumbers();
		sap.ui.getCore().applyChanges();

		// Assert
		oAdditionalNum = oObjectHeader.$().find(".additionalOHNumberDiv");
		assert.ok(!oAdditionalNum.length, "All additional numbers are destroyed.");
	});

	QUnit.test("Separator should be rendered when there is one additionalNumber", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oSeparator = oObjectHeader.$().find(".additionalOHNumberSeparatorDiv");
		assert.ok(oSeparator.length === 1, "Separator is rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Separator shouldn't be rendered when there is more than one additionalNumber", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			title: "test additional numbers",
			additionalNumbers: [
				new ObjectNumber({
					number: "2134",
					unit: "Conversion rate"
				}),
				new ObjectNumber({
					number: "1232134",
					unit: "EUR"
				})
			]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		var oSeparator = oObjectHeader.$().find(".additionalOHNumberSeparatorDiv");
		assert.ok(!oSeparator.length, "Separator is not rendered.");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.module("Contrast container in Belize");

	QUnit.test("Contrast container should be set when Background is not transparent", function (assert) {
		// Arrange
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container",
			backgroundDesign: BackgroundDesign.Solid
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(jQuery("#" + "contrastId").hasClass("sapContrastPlus"), "Contrast container class is rendered");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Contrast container should not be set when Background transparent", function (assert) {
		// Arrange
		// Create non responsive ObjectHeader which has Transparent background by default
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!jQuery("#" + "contrastId").hasClass("sapContrastPlus"), "Contrast container class is not rendered since the background is Transparent");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.test("Contrast container should be set when Background is changed from transparent to solid", function (assert) {
		// Arrange
		// Create non responsive ObjectHeader which has Transparent background by default
		var oObjectHeader = new ObjectHeader({
			id: "contrastId",
			title: "test contrast container"
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!jQuery("#" + "contrastId").hasClass("sapContrastPlus"), "Contrast container class is not rendered since the background is Transparent");

		oObjectHeader.setBackgroundDesign(BackgroundDesign.Solid);
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(jQuery("#" + "contrastId").hasClass("sapContrastPlus"), "Contrast container class is rendered when the background is Solid");

		// cleanup
		oObjectHeader.destroy();
	});

	QUnit.module("Rendering Markers aggregation");

	QUnit.test("Render Draft and Unsaved", function(assert) {
		var oObjectHeader = new ObjectHeader({
			id: "markersOH",
			title : "Markers agregation",
			number : "3.624",
			numberUnit : "EUR",
			markers: [
					new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft}),
					new ObjectMarker({id: "unsaved", type: ObjectMarkerType.Unsaved})
					]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.domById("draft"), "marker draft should be rendered.");
		assert.ok(jQuery.sap.domById("unsaved"), "marker unsaved should be rendered.");

		oObjectHeader.destroy();
	});

	QUnit.test("Test _hasMarkers function", function(assert) {
		var oObjectHeader = new ObjectHeader({
			title : "Markers agregation",
			markers: [
					new ObjectMarker({id: "draft", type: ObjectMarkerType.Draft}),
					new ObjectMarker({id: "unsaved", type: ObjectMarkerType.Unsaved})
					]
		});

		// System under test
		oObjectHeader.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();

		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return true for - ObjectHeader with markers aggregation and showMarkers property set to false");

		oObjectHeader.setShowMarkers(true);
		oObjectHeader.setMarkFavorite(true);
		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return true for - ObjectHeader with markers aggregation and showMarkers property set to true and markFavourite set to true");

		oObjectHeader.removeAggregation("markers");
		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return true for - ObjectHeader with no markers aggregation and showMarkers property set to true and markFavourite set to true");

		oObjectHeader.setMarkFavorite(false);
		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return false for - ObjectHeader with no markers aggregation and showMarkers property set to true and markFavourite set to false");

		oObjectHeader.setShowMarkers(false);
		assert.ok(oObjectHeader._hasMarkers(), "_hasMarker will return false for - ObjectHeader with no markers aggregation and showMarkers property set to false and markFavourite set to false");

		oObjectHeader.destroy();
	});
});