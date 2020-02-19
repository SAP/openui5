/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core",
	"sap/uxap/ObjectPageLayout",
	"sap/uxap/ObjectPageHeader",
	"sap/uxap/ObjectPageHeaderActionButton",
	"sap/m/Button",
	"sap/m/Link",
	"sap/m/Breadcrumbs",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/qunit/QUnitUtils"],
function ($, Core, ObjectPageLayout, ObjectPageHeader, ObjectPageHeaderActionButton, Button, Link, Breadcrumbs, XMLView, QUtils) {
	"use strict";

	var oFactory = {
			getLink: function (sText, sHref) {
				return new Link({
					text: sText || "Page 1 long link",
					href: sHref || "http://go.sap.com/index.html"
				});
			},
			getStringOfLength: function(iLength) {
				var sResult = "";
				while (iLength > 0) {
					sResult += "s";
					iLength--;
				}
				return sResult;
			}
		};

	QUnit.module("rendering API", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
		}
	});

	QUnit.test("Title block rendering", function (assert) {
		assert.ok(this.oHeaderView.$("title"), "Title block is rendered");
	});

	QUnit.test("Title rendering", function (assert) {
		assert.ok(this.oHeaderView.$("title").find(".sapUxAPObjectPageHeaderTitleTextWrappable"), "Title is rendered");
	});

	QUnit.test("Markers rendering", function (assert) {
		assert.ok(this.oHeaderView.$("-favorite"), "Favourite marker is rendered");
		assert.ok(this.oHeaderView.$("-flag"), "Flag marker is rendered");
	});

	QUnit.test("SelectTitleArrow rendering", function (assert) {
		assert.ok(this.oHeaderView.$("-titleArrow"), "Title Arrow is rendered");
	});

	QUnit.test("Locked mark rendering", function (assert) {
		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderLockBtn").length === 1, "Locked mark is rendered");
	});

	QUnit.test("Unsaved changes mark is not rendered when Locked mark is set", function (assert) {
		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderChangesBtn").length === 0, "Unsaved changes mark is not rendered when Locked mark is set");
	});

	QUnit.test("Unsaved changes mark rendering", function (assert) {
		this._oHeader = Core.byId("UxAP-ObjectPageHeader--header");
		this._oHeader.setMarkLocked(false);
		Core.applyChanges();

		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderChangesBtn").length === 1, "Unsaved chages mark is rendered");
	});

	QUnit.test("Tooltip rendering", function (assert) {
		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderTitleTextWrappable").attr("title") !== undefined, "Heading has title attribute");
	});

	QUnit.test("SubTitle rendering", function (assert) {
		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderIdentifierDescription").length === 1, "SubTitle is rendered");
	});

	QUnit.test("Image rendering", function (assert) {
		assert.ok(this.oHeaderView.$("title").find(".sapUxAPObjectPageHeaderObjectImage"), "Image is rendered");
	});

	QUnit.test("Actions rendering", function (assert) {
		assert.ok(this.oHeaderView.$("title").find(".sapUxAPObjectPageHeaderIdentifierActions"), "Action buttons are rendered");
	});
	QUnit.test("Placeholder rendering", function (assert) {
		assert.ok(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder"), "placeholder rendered");
	});
	QUnit.test("Updates when header invisible", function (assert) {
		var oPage = this.oHeaderView.byId("ObjectPageLayout"),
			oHeader = Core.byId("UxAP-ObjectPageHeader--header");

		oPage.setVisible(false);
		oPage.setShowTitleInHeaderContent(true);
		Core.applyChanges();

		try {
			oHeader.setObjectSubtitle("Updated");
			assert.ok(true, "no error upon update");
		} catch (e) {
			assert.ok(false, "Expected to succeed");
		}

		//restore
		oPage.setVisible(true);
		oPage.setShowTitleInHeaderContent(false);
	});

	QUnit.test("titleSelectorTooltip aggregation validation", function (assert) {
		var oHeader = Core.byId("UxAP-ObjectPageHeader--header"),
			oLibraryResourceBundleOP = oHeader.oLibraryResourceBundleOP,
			oTitleArrowIconAggr = oHeader.getAggregation("_titleArrowIcon"),
			oTitleArrowIconContAggr = oHeader.getAggregation("_titleArrowIconCont");

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), "Custom Tooltip", "titleSelectorTooltip aggregation is initially set");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), "Custom Tooltip", "_titleArrowIcon aggregation tooltip is initially set");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), "Custom Tooltip", "_titleArrowIconCont aggregation tooltip is initially set");

		oHeader.setTitleSelectorTooltip("Test tooltip");
		Core.applyChanges();

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), "Test tooltip", "titleSelectorTooltip aggregation is updated with the new value");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), "Test tooltip", "_titleArrowIcon aggregation tooltip is updated with the new value");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), "Test tooltip", "_titleArrowIconCont aggregation tooltip is updated with the new value");

		oHeader.destroyTitleSelectorTooltip();
		Core.applyChanges();

		assert.strictEqual(oHeader.getTitleSelectorTooltip(), null, "titleSelectorTooltip aggregation is destroyed");
		assert.strictEqual(oTitleArrowIconAggr.getTooltip(), oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"), "_titleArrowIcon aggregation tooltip is set to default");
		assert.strictEqual(oTitleArrowIconContAggr.getTooltip(), oLibraryResourceBundleOP.getText("OP_SELECT_ARROW_TOOLTIP"), "_titleArrowIconCont aggregation tooltip is set to default");
	});

	QUnit.test("Title text has constrained width", function (assert) {
		var oHeader = Core.byId("UxAP-ObjectPageHeader--header"),
			aTitleTextParts,
			iTitleTextParts,
			$titleWrapper,
			$titlePart,
			sLongTitle = oFactory.getStringOfLength(300) + " " + oFactory.getStringOfLength(400),
			done = assert.async();

		assert.expect(2);

		oHeader.addEventDelegate({
			onAfterRendering: function() {
				$titleWrapper = oHeader.$().find(".sapUxAPObjectPageHeaderIdentifierTitle");
				aTitleTextParts = oHeader.$().find(".sapUxAPObjectPageHeaderTitleText");
				iTitleTextParts = aTitleTextParts.length;
				for (var i = 0; i < iTitleTextParts; i++) {
					$titlePart = jQuery(aTitleTextParts.get(i));
					assert.ok($titlePart.width() <= $titleWrapper.width(), "width is within container");
				}
				done();
			}
		}, this);

		oHeader.setObjectTitle(sLongTitle);
		Core.applyChanges();
	});

	QUnit.module("image rendering", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				Core.applyChanges();
				this._oPage = this.oHeaderView.byId("ObjectPageLayout");
				this._oHeader = Core.byId("UxAP-ObjectPageHeader--header");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
			this._oPage = null;
			this._oHeader = null;
		}
	});

	QUnit.test("Image is in DOM if image URI", function (assert) {

		assert.strictEqual(this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 1, "image is in DOM");
	});

	QUnit.test("Image is in Background mode", function (assert) {
		assert.strictEqual(this._oPage.getHeaderTitle().getAggregation("_objectImage").getMode(), "Background", "image is in Background mode");
	});

	QUnit.test("Size of image is 'contain'", function (assert) {
		assert.strictEqual(this._oPage.getHeaderTitle().getAggregation("_objectImage").getBackgroundSize(), "contain", "size of image is 'contain'");
	});

	QUnit.test("Position of image is 'center'", function (assert) {
		assert.strictEqual(this._oPage.getHeaderTitle().getAggregation("_objectImage").getBackgroundPosition(), "center", "position of image is 'center'");
	});

	QUnit.test("Placeholder is hidden if image URI", function (assert) {

		assert.strictEqual(this.oHeaderView.$().find(".sapUxAPHidePlaceholder.sapUxAPObjectPageHeaderObjectImage").length, 1, "hidden placeholder is in DOM");
	});
	QUnit.test("Two different images in DOM if showTitleInHeaderContent===true", function (assert) {
		//act
		this._oPage.getHeaderTitle().setObjectImageURI("./img/HugeHeaderPicture.png");
		this._oPage.setShowTitleInHeaderContent(true);
		Core.applyChanges();

		assert.strictEqual(this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 2, "two images in DOM");

		var img1 = this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[0],
			img2 = this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[1];

		assert.notEqual(img1.id, img2.id, "two different images in DOM");
	});
	QUnit.test("Images in DOM updated on URI change", function (assert) {
		var sUpdatedSrc = "./img/imageID_273624.png";
		//act
		this._oPage.getHeaderTitle().setObjectImageURI(sUpdatedSrc);
		this._oPage.setShowTitleInHeaderContent(true);
		Core.applyChanges();

		assert.strictEqual(this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage").length, 2, "two images in DOM");

		var img1 = this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[0],
			img2 = this.oHeaderView.$().find(".sapMImg.sapUxAPObjectPageHeaderObjectImage")[1];

		assert.strictEqual($(img1).control()[0].getSrc(), sUpdatedSrc, "image1 is updated");
		assert.strictEqual($(img2).control()[0].getSrc(), sUpdatedSrc, "image2 is updated");
	});
	QUnit.test("Two different placeholders in DOM if showTitleInHeaderContent===true", function (assert) {
		//act
		this._oPage.getHeaderTitle().setObjectImageURI("");
		this._oPage.getHeaderTitle().setShowPlaceholder(true);
		this._oPage.setShowTitleInHeaderContent(true);
		Core.applyChanges();

		assert.strictEqual(this.oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon").length, 2, "two placeholders in DOM");

		var oPlaceholder1 = this.oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon")[0],
			oPlaceholder2 = this.oHeaderView.$().find(".sapUxAPObjectPageHeaderPlaceholder.sapUxAPObjectPageHeaderObjectImage .sapUiIcon")[1];

		 assert.notEqual(oPlaceholder1.id, oPlaceholder2.id, "two different placeholders in DOM");
	});

	QUnit.test("Placeholder should be of type sap.m.Avatar", function (assert) {
		// Act
		this._oPage.getHeaderTitle().setObjectImageURI("");
		this._oPage.getHeaderTitle().setShowPlaceholder(true);
		Core.applyChanges();

		// Assert
		assert.ok(this._oHeader.getAggregation("_placeholder").isA("sap.m.Avatar"), "Placeholder is of type sap.m.Avatar");
	});

	QUnit.test("Icons should be of type sap.m.Avatar", function (assert) {
		// Act
		this._oPage.getHeaderTitle().setObjectImageURI("sap-icon://accelerated");
		Core.applyChanges();

		// Assert
		assert.ok(this._oHeader.getAggregation("_objectImage").isA("sap.m.Avatar"), "The icon is of type sap.m.Avatar");
	});

	QUnit.module("layout calculation", {
	});
	QUnit.test("No extra scroll event upon layout calculation", function (assert) {

		var done = assert.async(),

		oHeader = new sap.uxap.ObjectPageHeader({
			objectTitle: "Long title that wraps and goes over more lines",
			objectSubtitle: "Long subtitle that wraps and goes over more lines",
			objectImageURI: "qunit/img/HugeHeaderPicture.png",
			showTitleSelector: true,
			showMarkers:true,
			markFavorite:true,
			markLocked:true,
			markFlagged:true,
			objectImageShape: "Circle",
			actions: [ new sap.m.Button({text: "Action"})]
		}),
		sIdentifierLineOrigHeight,
		oDelegate = { onAfterRendering: function() {
				sIdentifierLineOrigHeight = oHeader.$().find(".sapUxAPObjectPageHeaderIdentifier").get(0).style.height;
				oHeader.removeEventDelegate(oDelegate);
			}};

		oHeader.addEventDelegate(oDelegate, oHeader);

		var op = new sap.uxap.ObjectPageLayout({
				height: "300px",
				selectedSection: "s2",
				showTitleInHeaderContent: true,
				useIconTabBar: true,
				headerTitle: [
					oHeader
				],
				headerContent: [
					new sap.m.Text({
						width: "200px",
						text: "Hi, I'm Denise. I am passionate about what I do and I'll go the extra mile to make the customer win."
					})
				],
				sections: [
					new sap.uxap.ObjectPageSection("s1", {
						title: "section1",
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								blocks: [new sap.m.Text({ text: "Block content"})]
							})
						]
					}),
					new sap.uxap.ObjectPageSection("s2", {
						title: "2 subsections",
						subSections: [
							new sap.uxap.ObjectPageSubSection({
								title: "subsection1",
								blocks: [new sap.m.Text({ text: "Block content"})]
							}),
							new sap.uxap.ObjectPageSubSection("s2_2", {
								title: "subsection2",
								blocks: [new sap.m.Text({ text: "Block content"})]
							})
						]
					})
				]
			}),
		scrollSpy = sinon.spy(op, "_onScroll");

		op.placeAt("qunit-fixture");

		op.attachEventOnce("onAfterRenderingDOMReady", function() {
			op.scrollToSection("s2_2");// second subsection (in order to snap the header)
			setTimeout(function() {
				op.setSelectedSection("s1");
				setTimeout(function() {
					op.setSelectedSection("s1");
					setTimeout(function() {
						scrollSpy.reset(); // reset scroll spy for clean test

						// Act
						op.getHeaderTitle()._adaptLayout();
						setTimeout(function() {
							assert.ok(!scrollSpy.called, "no extra scroll upon header layout calculation");
							assert.strictEqual(oHeader.$().find(".sapUxAPObjectPageHeaderIdentifier").get(0).style.height, sIdentifierLineOrigHeight, "original css is unmodified");
							op.destroy(); // cleanup
							done();
						}, 1000);
					}, 1000);
				}, 1000);
			}, 1000);
		});


	});

	QUnit.module("Breadcrumbs API", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				Core.applyChanges();
				this._oHeader = Core.byId("UxAP-ObjectPageHeader--header");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
			this._oHeader = null;
		}
	});

	QUnit.test("Legacy breadCrumbsLinks: Trail of links in the ObjectPageHeader should dynamically update", function (assert) {
		var iInitialLinksCount = this._oHeader.getBreadCrumbsLinks().length,
			oNewLink = oFactory.getLink();

		this._oHeader.addBreadCrumbLink(oNewLink);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().length, iInitialLinksCount + 1,
			"The link was added to the breadcrumbs");

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[iInitialLinksCount].sId, oNewLink.sId,
			"The correct link was added to the breadcrumbs");

		assert.strictEqual(this._oHeader.indexOfBreadCrumbLink(oNewLink), iInitialLinksCount);

		this._oHeader.removeBreadCrumbLink(oNewLink);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().length, iInitialLinksCount,
			"The link was removed from the breadcrumbs");

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks().indexOf(oNewLink), -1,
			"The link was removed from the breadcrumbs");

		this._oHeader.removeAllBreadCrumbsLinks();

		assert.ok(!this._oHeader.getBreadCrumbsLinks().length,
			"There are no breadcrumb links left");

		this._oHeader.insertBreadCrumbLink(oNewLink, 0);

		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[0].sId, oNewLink.sId,
			"The link was added to in the correct position in the breadcrumb");

		this._oHeader.destroyBreadCrumbsLinks();

		assert.ok(oNewLink.bIsDestroyed, "There breadcrumbs are destroyed");
	});

	QUnit.module("API");

	QUnit.test("setObjectTitle", function (assert) {
		var sHeaderTitle = "myTitle",
			sHeaderNewTitle = "myNewTitle",
			oHeaderTitle =  new ObjectPageHeader({
			isObjectTitleAlwaysVisible: false,
			objectTitle: sHeaderTitle
		}),
		oNotifyParentSpy = this.spy(oHeaderTitle, "_notifyParentOfChanges"),
		oObjectPageWithHeaderOnly = new ObjectPageLayout({
			showTitleInHeaderContent:true,
			headerTitle: oHeaderTitle
		}).placeAt("qunit-fixture");

		Core.applyChanges();

		assert.equal(oHeaderTitle.getObjectTitle(), sHeaderTitle, "The initial title text is set correctly: " + sHeaderTitle);
		assert.ok(!oNotifyParentSpy.called, "_notifyParentOfChanges not called on first rendering");

		oHeaderTitle.setObjectTitle(sHeaderNewTitle);
		assert.equal(oHeaderTitle.getObjectTitle(), sHeaderNewTitle, "The new title text is set correctly: " + sHeaderNewTitle);
		assert.equal(oNotifyParentSpy.callCount, 1, "_notifyParentOfChanges called once after runtime change of the title text");

		oObjectPageWithHeaderOnly.destroy();
	});

	QUnit.test("setting objectImageAlt using binding specific symbols", function (assert) {
		var sImageAlt = "alt contains {",
			oHeaderTitle =  new ObjectPageHeader();

		// act
		oHeaderTitle.setObjectImageAlt(sImageAlt);

		// assert
		assert.equal(oHeaderTitle.getObjectImageAlt(), sImageAlt,
			"Setting curly brace as an image alt does not throw an error");

		// clean up
		oHeaderTitle.destroy();
	});

	QUnit.module("Private API", {
		beforeEach: function (assert) {
			var done = assert.async(),
				sViewXML = '<core:View xmlns:core="sap.ui.core" xmlns="sap.uxap" xmlns:layout="sap.ui.layout" xmlns:m="sap.m" height="100%">' +
				'<m:App>' +
					'<ObjectPageLayout id="objectPageLayout" subSectionLayout="TitleOnLeft">' +
						'<headerTitle>' +
							'<ObjectPageHeader id = "applicationHeader" objectTitle="My Pastube">' +
								'<actions>' +
									'<m:CheckBox id="testCheckBox" text="Test"/>' +
									'<ObjectPageHeaderActionButton id="installButton" text="Install" hideIcon="true" hideText="false" type="Emphasized"/>' +
									'<ObjectPageHeaderActionButton id="testButton2" text="Test Button" type="Emphasized"/>' +
								'</actions>' +
							'</ObjectPageHeader>' +
						'</headerTitle>' +
					'</ObjectPageLayout>' +
				'</m:App>' +
				'</core:View>';
			XMLView.create({
				definition: sViewXML
			}).then(function (oView) {
				this.myView = oView;
				this.myView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.myView.destroy();
		}
	});

	QUnit.test("_adaptActions", function (assert) {
		var oHeader = this.myView.byId("applicationHeader"),
			$overflowButton = oHeader._oOverflowButton.$();

		oHeader._adaptActions(100);

		assert.strictEqual($overflowButton.css("display"), "inline-block", "OverflowButton is shown");

		oHeader._adaptActions(1000);

		assert.strictEqual($overflowButton.css("display"), "none", "OverflowButton is hidden when not needed");
	});

	QUnit.test("_resizeIdentifierLineContainer is called when the action visibility is change", function (assert) {
		assert.expect(1);

		// setup
		var oHeader = this.myView.byId("applicationHeader"),
			done = assert.async(),
			oSecondBtn,
			spyIdentifierResize,
			oDelegate = {
				onAfterRendering: function() {
					oSecondBtn.removeEventDelegate(oDelegate); // cleanup

					// asert
					assert.ok(spyIdentifierResize.called, "identifier line container is recalculated.");
					done();
				}
			};

		oHeader.removeAllActions();
		oHeader.addAction(new sap.m.Button({text: "Button One"}))
			.addAction(new sap.m.Button("secondBtn" ,{text: "Button Two"}));
		oSecondBtn = Core.byId("secondBtn");

		// act
		oSecondBtn.setVisible(false);
		oHeader.setObjectTitle("VeryLongText".repeat(20));

		// act
		oSecondBtn.addEventDelegate(oDelegate);
		oSecondBtn.setVisible(true);
		spyIdentifierResize = sinon.spy(ObjectPageHeader.prototype, "_resizeIdentifierLineContainer");
	});

	QUnit.test("Action button press event parameter", function (assert) {
		var oHeader = this.myView.byId("applicationHeader"),
			oActionButton = this.myView.byId("installButton"),
			oActionSheetButton = oHeader._oActionSheetButtonMap[oActionButton.getId()],
			fnPressOutside = function (oEvent) {
				assert.strictEqual(oEvent.getParameter("bInOverflow"), undefined, "bInOverflow parameter is not passed from outside overflow");
			},
			fnPressInside = function (oEvent) {
				assert.strictEqual(oEvent.getParameter("bInOverflow"), true, "bInOverflow parameter is passed from inside overflow");
			};

		oActionButton.attachPress(fnPressOutside);
		QUtils.triggerKeyup(oActionButton.getId(), "SPACE");

		oActionButton.detachPress(fnPressOutside);
		oActionButton.attachPress(fnPressInside);

		QUtils.triggerKeyup(oHeader._oOverflowButton.getId(), "SPACE");
		QUtils.triggerKeyup(oActionSheetButton.getId(), "SPACE");
	});

	QUnit.test("_adaptLayoutForDomElement", function (assert) {
		var oHeader = this.myView.byId("applicationHeader"),
			$headerDomRef = oHeader.$(),
			oSpy = sinon.spy(oHeader, "_adaptObjectPageHeaderIndentifierLine");

		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(sap.ui.Device, "orientation", {
			portrait: true,
			landscape: false
		});

		// assert
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "visible", "Button is visible");

		oHeader._adaptLayoutForDomElement();

		// assert
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "visible", "Button is visible");

		oHeader._adaptLayoutForDomElement($headerDomRef);

		// assert
		assert.ok(oSpy.called, "The _adaptObjectPageHeaderIndentifierLine function is called");
	});

	QUnit.test("Change of action visibility should result in invalidation, layout adaptation", function (assert) {
		var done = assert.async();

		var oHeader = this.myView.byId("applicationHeader"),
			oInvalidateSpy = sinon.spy(oHeader, "invalidate"),
			oAdaptLayoutSpy = sinon.spy(oHeader, "_adaptLayoutForDomElement");

		var oActionButton = this.myView.byId("testButton2");

		oInvalidateSpy.reset();
		oAdaptLayoutSpy.reset();

		var oDelegate = {
			onAfterRendering: function() {
				oHeader.removeEventDelegate(oDelegate);

				assert.ok(oAdaptLayoutSpy.called, "the layout re-calculations are triggered after a new rendering");

				done();
			}
		};

		oHeader.addEventDelegate(oDelegate);

		assert.notOk(oInvalidateSpy.called, "ObjectPageHeader is not invalidated yet");
		assert.notOk(oAdaptLayoutSpy.called, "_adaptLayoutForDomElement is not called yet");

		oActionButton.setVisible(false);

		assert.ok(oInvalidateSpy.called, "ObjectPageHeader was invalidated");
	});

	QUnit.test("_adaptLayoutForDomElement is not called for each action visibility change", function (assert) {
		// Arrange
		var done = assert.async(),
			oHeader = this.myView.byId("applicationHeader"),
			oAdaptLayoutSpy = sinon.spy(oHeader, "_adaptLayoutForDomElement"),
			oActionTestButton = this.myView.byId("testButton2"),
			oActionInstallButton = this.myView.byId("installButton"),
			oActionCheckBox = this.myView.byId("testCheckBox"),
			oDelegate = {
			onAfterRendering: function() {
				oHeader.removeEventDelegate(oDelegate);

				// Assert
				// "_adaptLayoutForDomElement" is called two times: once from ObjectPageHeader's onAfterRendering function,
				// and once from ObjectPageLayout's _appendTitleCloneToDOM function.
				assert.strictEqual(oAdaptLayoutSpy.callCount, 2,
					"The layout re-calculations are not triggered for each button visiblity change");

				// Clean up
				done();
			}
		};

		oHeader.addEventDelegate(oDelegate);
		assert.expect(1);

		// Act
		oActionTestButton.setVisible(false);
		oActionInstallButton.setVisible(false);
		oActionCheckBox.setVisible(false);
	});

	QUnit.test("_adaptLayoutForDomElement skips calculations if 0 width", function (assert) {

		var oHeader = this.myView.byId("applicationHeader"),
			$headerDom = oHeader.$(),
			$headerDomClone,
			oOverflowButton = oHeader._oOverflowButton;

		// Setup
		oOverflowButton.getDomRef().style.display = "none"; // ensure overflow button not visible
		$headerDomClone = $headerDom.clone(); // do not add the clone to DOM => it has 0 width
		assert.strictEqual($headerDomClone.width(), 0, "dom clone has 0 width"); // assert init state

		// Act
		oHeader._adaptLayoutForDomElement($headerDomClone);

		// Check
		assert.strictEqual(oOverflowButton.getDomRef().style.display, "none", "overflow button is still not visible");
	});

	QUnit.test("_getActionsWidth", function (assert) {
		this.stub(sap.ui.Device, "system", {
			desktop: false,
			phone: true,
			tablet: false
		});

		this.stub(sap.ui.Device, "orientation", {
			portrait: true,
			landscape: false
		});

		// act
		this.myView.byId("applicationHeader")._getActionsWidth();

		// assert
		assert.strictEqual(this.myView.byId("testCheckBox").$().css("visibility"), "visible", "sap.m.CheckBox is visible");
		assert.strictEqual(this.myView.byId("installButton").$().css("visibility"), "hidden", "ObjectPageHeaderActionButton is hidden");
	});

	QUnit.test("_findById can find within given element", function (assert) {

		var oHeader = this.myView.byId("applicationHeader"),
			$HeaderClone = oHeader.$().clone(),
			$HeaderClone_identifier;

		// Act: search element within the clone
		$HeaderClone_identifier = oHeader._findById($HeaderClone, "identifierLine");

		assert.ok(jQuery.contains($HeaderClone.get(0), $HeaderClone_identifier.get(0)), "returned element is part of clone");
		assert.ok(!jQuery.contains(oHeader.getDomRef(), $HeaderClone_identifier.get(0)), "returned element is not part of the original element");
	});

	QUnit.test("_findById can find id with special characters", function (assert) {

		var oHeader = this.myView.byId("applicationHeader"),
			sIdWithSpecialChars = oHeader.getId() + "-my.action",
			$HeaderClone,
			$HeaderClone_action;

		// setup
		oHeader.addAction(new sap.m.Button(sIdWithSpecialChars));
		sap.ui.getCore().applyChanges();

		// create the search context
		$HeaderClone = oHeader.$().clone();

		// Act: search element within the context
		$HeaderClone_action = oHeader._findById($HeaderClone, "my.action");

		assert.ok(jQuery.contains($HeaderClone.get(0), $HeaderClone_action.get(0)), "returned element is part of clone");
	});

	QUnit.module("Action buttons", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				Core.applyChanges();
				this._oHeader = Core.byId("UxAP-ObjectPageHeader--header");
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
			this._oHeader = null;
		}
	});

	QUnit.test("Adding action buttons as invisible doesn't prevent them from becoming default", function (assert) {

		var oActionButton = new ObjectPageHeaderActionButton({
			text:"Invisible Button",
			visible: false
		});

		this._oHeader.addAction(oActionButton);

		Core.applyChanges();

		oActionButton.setVisible(true);

		Core.applyChanges();

		assert.strictEqual(oActionButton.getType(), "Default",
			"The button is default");
	});

	QUnit.test("Setting visibility to action buttons", function (assert) {
		var oButton = new Button({
			text : "Some button",
			visible: false
		});

		this._oHeader.addAction(oButton);

		Core.applyChanges();

		oButton.setVisible(true);

		Core.applyChanges();

		assert.strictEqual(oButton._getInternalVisible(), true, "The button is visible");
		assert.ok(this._oHeader._oOverflowButton.$().is(':hidden'), "There is no overflow button");

		oButton.setVisible(false);

		Core.applyChanges();

		assert.strictEqual(oButton._getInternalVisible(), false, "The button is invisible");
		assert.ok(this._oHeader._oOverflowButton.$().is(':hidden'), "There is no overflow button");

	});

	QUnit.module("Resize", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
		}
	});

	QUnit.test("Resize listener is called after rerender while hidden", function (assert) {
		var oHeader = this.oHeaderView.byId("header"),
			oSpy = sinon.spy(oHeader, "_adaptLayoutForDomElement"),
			done = assert.async();

		// Setup: hide the container where the header is placed
		this.oHeaderView.$().hide();

		var oDelegate = {
			onAfterRendering: function() {
				oHeader.removeEventDelegate(oDelegate); // cleanup

				oSpy.reset();
				// Act: show the view
				this.oHeaderView.$().show();

				setTimeout(function() {
					assert.ok(oSpy.called, "the layout re-calculations are triggered");
					done();
				}, 300);
			}.bind(this)
		};

		oHeader.addEventDelegate(oDelegate);
		// Act: rerender the header while hidden
		oHeader.rerender();
	});

	QUnit.module("Breadcrumbs rendering", {
		beforeEach: function (assert) {
			var done = assert.async();
			XMLView.create({
				id: "UxAP-ObjectPageHeader",
				viewName: "view.UxAP-ObjectPageHeader"
			}).then(function (oView) {
				this.oHeaderView = oView;
				this.oHeaderView.placeAt("qunit-fixture");
				this._oHeader = Core.byId("UxAP-ObjectPageHeader--header");
				this._oHeader.destroyBreadCrumbsLinks();
				this._oHeader.destroyBreadcrumbs();
				Core.applyChanges();
				done();
			}.bind(this));
		},
		afterEach: function () {
			this.oHeaderView.destroy();
			this._oHeader = null;
		}
	});

	QUnit.test("There should be no BreadCrumbs rendered", function (assert) {
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 0, "There are No instances of sap.m.Breadcrumbs rendered in ObjectPageHeader");
	});

	QUnit.test("After inserting a link in Legacy breadCrumnsLinks aggregation, the Legacy breadCrumbsLinks aggregation should be rendered", function (assert) {
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		Core.applyChanges();
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadCrumbsLinks()[0].$().length > 0, "Legacy breadCrumbsLinks is rendered");
	});

	QUnit.test("After setting the New breadcrumbs aggregation, the New breadcrumbs aggregation should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new Breadcrumbs());
		Core.applyChanges();
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation is rendered");
	});

	QUnit.test("Having both New breadcrumbs and Legacy breadCrumbsLinks, the New breadcrumbs aggregation should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new Breadcrumbs());
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		Core.applyChanges();
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation is rendered");
		assert.strictEqual(this._oHeader.getBreadCrumbsLinks()[0].$().length, 0, "Legacy breadCrumbsLinks is Not rendered");
	});

	QUnit.test("Having both New breadcrumbs and Legacy breadCrumbsLinks. After destroying the New breadcrumbs, Legacy breadCrumbsLinks should be rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new Breadcrumbs());
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		Core.applyChanges();
		this._oHeader.destroyBreadcrumbs();
		Core.applyChanges();
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadCrumbsLinks()[0].$().length > 0, "Legacy breadCrumbsLinks is rendered");
	});

	QUnit.test("Having the New breadcrumbs aggregation. After adding the Legacy breadCrumbsLinks, New  breadcrumbs should remain rendered", function (assert) {
		this._oHeader.setBreadcrumbs(new Breadcrumbs());
		Core.applyChanges();
		this._oHeader.insertBreadCrumbLink(oFactory.getLink());
		Core.applyChanges();
		assert.strictEqual(this.oHeaderView.$().find(".sapMBreadcrumbs").length, 1, "There is one instance of sap.m.Breadcrumbs rendered in ObjectPageHeader");
		assert.ok(this._oHeader.getBreadcrumbs().$().length > 0, "the New breadcrumbs aggregation should be rendered");
	});

	QUnit.module("Lifecycle", {
		beforeEach: function () {
			this.oOPH = new ObjectPageHeader();
		},
		afterEach: function () {
			this.oOPH.destroy();
			this.oOPH = null;
		},
		/**
		 * Fill internal object with mock buttons to simulate rendered control with buttons
		 */
		generateMockedASButtons: function () {
			this.mockButton1 = new Button();
			this.mockButton2 = new Button();

			this.oOPH._oActionSheetButtonMap = {
				__button1: this.mockButton1,
				__button2: this.mockButton2
			};
		},
		/**
		 * Assert that there are no available buttons in the map and all mock buttons are destroyed
		 * @param {object} assert qUnit "assert" reference
		 */
		assertAllButtonsAreDestroyed: function (assert) {
			assert.strictEqual(this.mockButton1._bIsBeingDestroyed, true, "Mock button 1 is destroyed");
			assert.strictEqual(this.mockButton2._bIsBeingDestroyed, true, "Mock button 2 is destroyed");
			assert.deepEqual(this.oOPH._oActionSheetButtonMap, {}, "Internal _oActionSheetButtonMap should be empty");
		}
	});

	QUnit.test("_oActionSheetButtonMap contained buttons are destroyed on re-rendering", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act - call onBeforeRendering to simulate control invalidation
		this.oOPH.onBeforeRendering.call(this.oOPH);

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

	QUnit.test("_oActionSheetButtonMap contained buttons are destroyed on control destruction", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act - destroy the control
		this.oOPH.destroy();

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

	QUnit.test("_resetActionSheetMap method destroys all buttons and empty's the object", function (assert) {
		// Arrange
		this.generateMockedASButtons();

		// Act
		this.oOPH._resetActionSheetMap.call(this.oOPH);

		// Assert
		this.assertAllButtonsAreDestroyed(assert);
	});

});
