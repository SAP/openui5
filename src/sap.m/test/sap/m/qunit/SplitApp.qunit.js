/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/Device",
	"sap/m/SplitApp",
	"sap/m/ScrollContainer",
	"sap/m/Page",
	"sap/m/Bar",
	"sap/m/Button",
	"jquery.sap.global",
	"sap/m/NavContainer",
	"sap/m/library",
	"jquery.sap.keycodes",
	"jquery.sap.mobile"
], function(
	qutils,
	createAndAppendDiv,
	Device,
	SplitApp,
	ScrollContainer,
	Page,
	Bar,
	Button,
	jQuery,
	NavContainer,
	mobileLibrary
) {
	// shortcut for sap.m.SplitAppMode
	var SplitAppMode = mobileLibrary.SplitAppMode;

	// shortcut for jQuery.device
	var device = jQuery.device;

	createAndAppendDiv("content");

	function getBgDomElement(oApp) {
		return document.getElementById(oApp.getId() + "-BG");
	}

	function getAbsoluteURL(sRelPath) {
		return document.baseURI + sRelPath;
	}

	var sBackgroundImageSrc  = "test-resources/sap/m/images/SAPLogo.jpg";

	QUnit.module("Initial Check");

	QUnit.test("Initialization on desktop", function(assert) {
		var oSystem = {
			desktop: true,
			tablet: false,
			phone: false
		};

		this.stub(Device, "system", oSystem);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.ok(jQuery.sap.byId("master").length, "Master page should be rendered initially.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail page should be rendered initially.");

		oSplitApp.destroy();
	});

	QUnit.module("Modes Check on desktop");
	QUnit.test("PopoverMode_portrait", function(assert){
		var done = assert.async();
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1"
				}),
				new Page("master2",{
					title : "Master 2"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "PopoverMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oSplitApp.isMasterShown(), false, "Master area is NOT shown");

		oSplitApp._oPopOver.attachAfterOpen(function(){
			assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
			assert.ok(jQuery.sap.byId("splitapp-Popover").length, "Popover should be rendered.");
			assert.ok(oSplitApp.isMasterShown(), "Master area is shown");
			assert.equal(oSplitApp._oPopOver.getContent().length,1, "Popover content should not be empty.");
			assert.ok(jQuery.sap.byId("splitapp-MasterBtn").length, "Master Button should be rendered");
			assert.ok(jQuery.sap.byId("splitapp-MasterBtn").is(":visible"), "Master Button is shown");
			assert.ok(jQuery.sap.byId("detail").length, "Detail page should be rendered  initially.");
			assert.equal(oSplitApp.$().children().length,2, "SplitApp should only contain the detail nav container.");
			assert.equal(oSplitApp._oMasterNav.getParent().getId(), "splitapp-Popover", "Parent of Master Nav container page should be Popover.");
			oSplitApp.destroy();
			done();
		});
		oSplitApp._oPopOver.openBy(oSplitApp._oShowMasterBtn);
	});

	QUnit.test("ShowHideMode_portrait", function(assert){
		var done = assert.async();
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "ShowHideMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.equal(oSplitApp._oMasterNav.getParent().getId(), "splitapp", "Parent of Master page should be SpltApp.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered initially.");
		assert.ok(jQuery.sap.byId("master").length, "Master Nav Container should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), false, "Master area is NOT shown");
		assert.ok(jQuery.sap.byId("splitapp-MasterBtn").length, "Master Button should be rendered");
		assert.ok(!jQuery.sap.byId("splitapp-MasterBtn").is(":hidden"), "Master Button is shown");
		assert.equal(oSplitApp.$().children().length, 3, "Splitapp should render both master and detail.");

		oSplitApp.showMaster();
		setTimeout(function(){
			assert.equal(oSplitApp.isMasterShown(), true, "Master area is shown");
			oSplitApp.destroy();
			done();
		}, 400);
	});

	QUnit.test("StretchCompressMode_portrait", function(assert){
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "StretchCompressMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.ok(jQuery.sap.byId("detail").length, "Master Nav Container should be rendered initially.");
		//assert.equal(jQuery("#splitapp-MasterBtn").css("display"), "none", "Master Button is not shown");	           TODO
		assert.equal(oSplitApp.$().children().length, 3, "Master page should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), true, "Master area is shown");
		assert.equal(jQuery.sap.byId("splitapp-Master").outerWidth(), 320, "Master width should be 320px.");
		oSplitApp.destroy();
	});

	QUnit.test("PopoverMode_landscape", function(assert){
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oLandscape = {
				landscape: true,
				portrait: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "PopoverMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered");
		assert.ok(jQuery.sap.byId("master").length, "Master Nav Container page should be rendered");
		assert.equal(oSplitApp.$().children().length, 3, "Master page should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), true, "Master area is shown");
		assert.equal(oSplitApp.$("Master").outerWidth(),320, "Master width should be 320px.");

		oSplitApp.destroy();
	});

	QUnit.test("ShowHideMode_landscape", function(assert){
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oLandscape = {
				landscape: true,
				portrait: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "ShowHideMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered");
		assert.ok(jQuery.sap.byId("master").length, "Master Nav Container should be rendered");
		assert.equal(oSplitApp.$().children().length, 3 ,"Master page should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), true, "Master area is shown");
		assert.equal(oSplitApp.$("Master").outerWidth(), 320, "Master width should be 320px.");

		oSplitApp.destroy();
	});

	QUnit.test("StretchCompressMode_landscape", function(assert){
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oLandscape = {
				landscape: true,
				portrait: false
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oLandscape);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "StretchCompressMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered");
		assert.ok(jQuery.sap.byId("master").length, "Master Nav Container should be rendered");
		assert.equal(oSplitApp.$().children().length, 3, "Master page should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), true, "Master area is shown");

		assert.ok(!jQuery.sap.byId("splitapp-Master").is(":hidden"),"Master should be visible.");
		assert.equal(jQuery.sap.byId("splitapp-Master").outerWidth(),320, "Master width should be 320px.");
		oSplitApp.destroy();
	});

	QUnit.test("HideMode", function(assert){
		var oSystem = {
			desktop: true,
			tablet: false,
			phone: false
		};

		this.stub(Device, "system", oSystem);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "HideMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
		assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered initially.");
		assert.ok(jQuery.sap.byId("splitapp-MasterBtn").length, "Master Button should be rendered");
		assert.equal(oSplitApp.$().children().length, 3, "Master page should be rendered initially.");
		assert.equal(oSplitApp.isMasterShown(), false, "Master area is NOT shown");
		assert.ok(jQuery.sap.byId("splitapp-Master").position().left <= -320, "Master should be hidden.");
		oSplitApp.destroy();
	});

	QUnit.module("Public Methods");
	QUnit.test("ShowMaster", function(assert){
		var done = assert.async();
		var oSystem = {
				desktop: true,
				tablet: false,
				phone: false
			}, oPortrait = {
				landscape: false,
				portrait: true
			};

		this.stub(Device, "system", oSystem);
		this.stub(Device, "orientation", oPortrait);

		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "ShowHideMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		oSplitApp.showMaster();

		setTimeout(function(){
			assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
			assert.equal(oSplitApp._oPopOver.getContent().length, 0, "Popover content should be empty.");
			assert.ok(jQuery.sap.byId("detail").length, "Detail Nav Container should be rendered");
			assert.ok(jQuery.sap.byId("master").length, "Master Nav Container should be rendered");
			assert.equal(oSplitApp.$().children().length, 3, "Master page should be rendered initially.");

			assert.ok(!jQuery("#splitapp-Master").is(":hidden"),"Master should not be hidden.");
			assert.equal(jQuery("#splitapp-Master").outerWidth(), 320, "Master width should be 320px.");
			oSplitApp.destroy();
			done();
		}, 500);
	});

	QUnit.test("Initialization on phone", function(assert) {
		var oSystem = {
			desktop: false,
			tablet: false,
			phone: true
		};
		this.stub(Device, "system", oSystem);
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			],
			mode: "ShowHideMode"
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(jQuery.sap.byId("splitapp").length, "SplitApp is rendered in the beginning.");
		assert.ok(jQuery.sap.byId("master").length, "Master Nav Container should be rendered initially.");
		assert.equal(jQuery.sap.byId("detail").length , 0, "Detail Nav Container should not be rendered.");
		assert.equal(jQuery.sap.byId("splitapp-MasterBtn").length, 0, "Master Button should not be rendered");
		oSplitApp.destroy();
	});

	// Tests for all modes
	QUnit.module("Master / Detail page aggregation");
	QUnit.test("Master / Detail page aggregation returns the right pages in the right order", function(assert) {
		var oMasterPage = new Page("master",{
			title : "Master 1",
			content: [new Button("Button", {text: "That is a Button"})]
		});
		var oMasterPage2 = new Page("master2",{
			title : "Master 1"
		});
		var oDetailPage = new Page("detail",{
			title : "Detail 1"
		});
		var oDetailPage2 = new Page("detail2",{
			title : "Detail 2"
		});
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				oMasterPage, oMasterPage2
			],
			detailPages: [
				oDetailPage, oDetailPage2
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oSpyIndexOfPage = this.spy(oSplitApp._oMasterNav, "indexOfPage");

		var aMaster = oSplitApp.getMasterPages();
		var aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 2, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 2, "Detail page aggregation contains the right number of pages");

		assert.equal(oSplitApp.indexOfMasterPage(oMasterPage), 0, "Master page is in the right aggregation and order");
		assert.equal(oSplitApp.indexOfMasterPage(oMasterPage2), 1, "Master page 2 is in the right aggregation and order");
		assert.equal(oSplitApp.indexOfDetailPage(oDetailPage), 0, "Detail page is in the right aggregation and order");
		assert.equal(oSplitApp.indexOfDetailPage(oDetailPage2), 1, "Detail page 2 is in the right aggregation and order");

		var oSpyIndexOfMasterPage = this.spy(oSplitApp, "_indexOfMasterPage");
		assert.equal(oSplitApp.indexOfAggregation("masterPages", oMasterPage), 0, "Master page is in the right aggregation and order");

		assert.ok(!oSpyIndexOfPage.called, "Right delegate method was called");
		assert.ok(oSpyIndexOfMasterPage.called, "Right delegate method was called");
		oSplitApp.destroy();
	});

	QUnit.test("Adding / Removing Pages to/from Master / Detail", function(assert) {
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oNewMasterPage = new Page("newMasterPage1",{
			title : "Master 1"
		});

		var oSpyInsertPage = this.spy(oSplitApp._oMasterNav, "insertPage");
		var oSpyRemovePage = this.spy(oSplitApp._oMasterNav, "removePage");

		oSplitApp.addMasterPage(oNewMasterPage);

		var oNewDetailPage = new Page("newDetailPage1",{
			title : "Detail 1"
		});

		oSplitApp.addDetailPage(oNewDetailPage);

		var aMaster = oSplitApp.getMasterPages();
		var aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 3, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 3, "Detail page aggregation contains the right number of pages");

		oSplitApp.removeMasterPage(oNewMasterPage);
		oSplitApp.removeDetailPage(oNewDetailPage);

		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 2, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 2, "Detail page aggregation contains the right number of pages");

		oSplitApp.addMasterPage(oNewMasterPage);
		oSplitApp.addDetailPage(oNewDetailPage);
		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 3, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 3, "Detail page aggregation contains the right number of pages");

		oNewDetailPage.destroy();
		oNewMasterPage.destroy();
		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 2, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 2, "Detail page aggregation contains the right number of pages");

		assert.ok(oSpyInsertPage.called, "Right delegate method was called");
		assert.ok(oSpyRemovePage.called, "Right delegate method was called");

		oSplitApp.destroy();
	});

	QUnit.test("Moving Page from Master to Detail", function(assert) {
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oMovePage = new Page("movePagePage1",{
			title : "Detail 1"
		});

		var aMaster;
		var aDetail;

		oSplitApp.addMasterPage(oMovePage);
		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 3, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 2, "Detail page aggregation contains the right number of pages");

		oSplitApp.addDetailPage(oMovePage);
		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 2, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 3, "Detail page aggregation contains the right number of pages");

		oSplitApp.removeDetailPage(oMovePage);
		aMaster = oSplitApp.getMasterPages();
		aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 2, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 2, "Detail page aggregation contains the right number of pages");

		oMovePage.destroy();
		oSplitApp.destroy();
	});

	QUnit.test("Insert Page", function(assert) {
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aMaster;

		var oSpyInsertPage = this.spy(oSplitApp._oMasterNav, "insertPage");

		var oInsertPage = new Page("insertPagePage",{
			title : "Detail 1"
		});

		oSplitApp.insertMasterPage(oInsertPage, 1);
		aMaster = oSplitApp.getMasterPages();
		assert.equal(aMaster.length, 3, "Master page aggregation contains the right number of pages");
		assert.equal(oSplitApp.indexOfMasterPage(oInsertPage), 1, "Master page is in the right position");
		oInsertPage.destroy();

		// Check against native implementation
		var oNavContainer = new NavContainer("navcontainer", {});
		var oInsertPage1 = new Page("insertPagePage1",{
			title : "Detail 1"
		});
		var oInsertPage2 = new Page("insertPagePage2",{
			title : "Detail 1"
		});
		var oInsertPage3 = new Page("insertPagePage3",{
			title : "Detail 1"
		});
		oNavContainer.addPage(oInsertPage1);
		oNavContainer.addPage(oInsertPage2);
		oNavContainer.insertPage(oInsertPage3, 1);
		assert.equal(oNavContainer.indexOfPage(oInsertPage3), 1, "Validation against native Implementation: Page is in the right position");

		assert.ok(oSpyInsertPage.called, "Right delegate method was called");

		oNavContainer.destroy();
		oSplitApp.destroy();
	});

	QUnit.test("Remove all pages", function(assert) {
		var oSplitApp = new SplitApp("splitapp", {
			masterPages: [
				new Page("master",{
					title : "Master 1",
					content: [new Button("Button", {text: "That is a Button"})]
				}),
				new Page("master2",{
					title : "Master 1"
				})
			],
			detailPages: [
				new Page("detail",{
					title : "Detail 1"
				}),
				new Page("detail2",{
					title : "Detail 2"
				})
			]
		});
		oSplitApp.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oSpyRemoveAllPages = this.spy(oSplitApp._oMasterNav, "removeAllPages");

		oSplitApp.removeAllMasterPages();
		oSplitApp.removeAllDetailPages();

		var aMaster = oSplitApp.getMasterPages();
		var aDetail = oSplitApp.getDetailPages();
		assert.equal(aMaster.length, 0, "Master page aggregation contains the right number of pages");
		assert.equal(aDetail.length, 0, "Detail page aggregation contains the right number of pages");

		assert.ok(oSpyRemoveAllPages.called, "Right delegate method was called");

		oSplitApp.destroy();
	});

	QUnit.test("keyboard handling with showMasterButton", function(assert){
		var done = assert.async();
		var oSystem = {
				desktop: true,
				phone: false,
				tablet: false
			};

		this.stub(Device, "system", oSystem);

		this.stub(device, "is", oSystem);

		var	oSplitApp1 = new SplitApp({
			mode: SplitAppMode.HideMode
		});

		var page = new Page("master_1");
		var page2 = new Page("detail_1");
		oSplitApp1.addMasterPage(page).addDetailPage(page2);

		oSplitApp1.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oMasterButton = oSplitApp1._oShowMasterBtn;
		assert.ok(oMasterButton.getDomRef(), "Master Button is rendered");
		assert.ok(oMasterButton.$().css("display") !== "none", "Master Button should be shown");
		oMasterButton.$().focus();
		sap.ui.test.qunit.triggerKeydown(oMasterButton.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		sap.ui.test.qunit.triggerKeyup(oMasterButton.getDomRef(), jQuery.sap.KeyCodes.ENTER);
		setTimeout(function(){
			assert.ok(oSplitApp1.isMasterShown(), "Master should be opened");
			oSplitApp1.destroy();
			done();
		}, 500);
	});

	QUnit.module("backgroundColor", {
		beforeEach: function () {
			this.oSplitApp = new SplitApp();
			this.oSplitApp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitApp.destroy();
			this.oSplitApp = null;
		}
	});

	QUnit.test("only valid color is set to DOM element", function(assert) {
		var oApp = this.oSplitApp;

		oApp.setBackgroundColor("blue;5px solid red;");

		// Act
		oApp.rerender();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundColor, '', "correct property value");
	});


	QUnit.module("backgroundImage", {
		beforeEach: function () {
			this.oSplitApp = new SplitApp();
			this.oSplitApp.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitApp.destroy();
			this.oSplitApp = null;
		}
	});

	QUnit.test("style is set to DOM element", function(assert) {

		var oApp = this.oSplitApp;
		// Act
		oApp.setBackgroundImage(sBackgroundImageSrc);
		sap.ui.getCore().applyChanges();

		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundImage, 'url(\"' + (Device.browser.safari ? getAbsoluteURL(sBackgroundImageSrc) : sBackgroundImageSrc) + '\")',
			"correct property value");
	});


	QUnit.test("url value with special characters", function(assert) {
		var oApp = this.oSplitApp,
			sPath = "images/",
			sUnreservedChars = "img100-._~",
			sReservedChars1 = encodeURIComponent("#[]@"), // skipped  :/?  because of OS restriction
			sReservedChars2 = encodeURIComponent("!$&'()+,;="),
			sOtherChars = encodeURIComponent(" çéд"),
			sReservedCharsUnencoded = "$",
			sFileExtension = ".png",
			sQuery = "?q1=1&q2=2",
			sImgSrc1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
			sImgSrc2 = sPath + sUnreservedChars + sReservedChars1 + sReservedChars2 + sOtherChars + sReservedCharsUnencoded + sFileExtension + sQuery;

		oApp.setBackgroundImage(sImgSrc1);
		sap.ui.getCore().applyChanges();
		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundImage, 'url(\"' + sImgSrc1 + '\")',
			"correct property value");

		oApp.setBackgroundImage(sImgSrc2);
		sap.ui.getCore().applyChanges();
		// Check
		assert.strictEqual(getBgDomElement(oApp).style.backgroundImage, 'url(\"' + (Device.browser.safari ? getAbsoluteURL(sImgSrc2) : sImgSrc2) + '\")',
			"correct property value");
	});


	QUnit.test("encodes css-specific chars in backgroundImage value", function(assert) {
		// Arrange
		var sImageSrc = sBackgroundImageSrc + ");border:5px solid red;",
			oApp = this.oSplitApp,
			oAppDom = getBgDomElement(oApp),
			sBorderBeforeTest = oAppDom.style.border;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		sap.ui.getCore().applyChanges();

		// Check
		oAppDom = getBgDomElement(oApp);
		assert.strictEqual(oAppDom.style.border, sBorderBeforeTest, "preserved border style value");
	});


	QUnit.test("encodes html-specific chars in backgroundImage style", function(assert) {
		// Arrange
		var sImageSrc = sBackgroundImageSrc + ')"; onmouseover="console.log"',
			oApp = this.oSplitApp,
			oAppDom = getBgDomElement(oApp),
			oHandlerBeforeTest = oAppDom.onmouseover;

		// Act
		oApp.setBackgroundImage(sImageSrc);
		sap.ui.getCore().applyChanges();

		// Check
		oAppDom = getBgDomElement(oApp);
		assert.strictEqual(oAppDom.onmouseover, oHandlerBeforeTest, "preserved handler value");
	});

	QUnit.module("Show Hide module", {
		beforeEach: function () {
			var oMasterPage = new Page("master11", {
				title: "Master"
			});
			var oDetailPage = new Page("detail11", {
				title: "Detail 1",
				content: [],
				showNavButton: jQuery.device.is.phone,
				navButtonText: "Back",
				navButtonPress: function() {
					this.oSplitApp.backDetail();
				},
				subHeader: new Bar({
					contentMiddle: [
						this.oStrechButton = new Button({
							text: "stretch/compress",
							press: function() {
								this.oSplitApp.setMode(sap.m.SplitAppMode.StretchCompressMode);
							}.bind(this)
						}),
						this.oHideButton =  new Button("saHideMasterMode", {
							text: "hide",
							press: function() {
								this.oSplitApp.setMode(sap.m.SplitAppMode.HideMode);
							}.bind(this)
						})
					]
				})
			}).addStyleClass("sapUiStdPage");
			this.oSplitApp = new SplitApp({
				detailPages: [oDetailPage],
				masterPages: [oMasterPage],
				initialDetail: "detail11",
				initialMaster: "master11"
			});

			this.oSplitApp.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oSplitApp.destroy();
			this.oSplitApp = null;

			this.oStrechButton.destroy();
			this.oStrechButton = null;

			this.oHideButton.destroy();
			this.oHideButton = null;
		}
	});

	QUnit.test("encodes html-specific chars in backgroundImage style", function(assert) {
		// Act
		this.oHideButton.firePress();
		sap.ui.getCore().applyChanges();

		// Check
		assert.strictEqual(this.oSplitApp._oShowMasterBtn.getTooltip(), "Show Master", 'Tooltip is should be "Show Master"');

		// Act
		this.oStrechButton.firePress();
		sap.ui.getCore().applyChanges();
		this.oHideButton.firePress();
		sap.ui.getCore().applyChanges();

		// Check
		assert.strictEqual(this.oSplitApp._oShowMasterBtn.getTooltip(), "Show Master", 'Tooltip is should be "Show Master"');
	});

	QUnit.module("SplitApp in container with semantic rendering", {
		beforeEach: function () {

			this.oScrollContainer = new ScrollContainer({
				content: [
					new SplitApp()
				]
			});

			this.oScrollContainer.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
			this.oScrollContainer = null;
		}
	});

	QUnit.test("parents elements height", function(assert) {
		assert.strictEqual(this.oScrollContainer.getDomRef().firstChild.style.height, '100%', "height is set correctly");

		this.oScrollContainer.invalidate();
		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oScrollContainer.getDomRef().firstChild.style.height, '100%', "height is set correctly");
	});
});