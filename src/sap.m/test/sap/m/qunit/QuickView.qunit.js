/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/model/json/JSONModel",
	"sap/m/library",
	"sap/m/App",
	"sap/m/Page",
	"sap/m/QuickView",
	"sap/m/QuickViewPage",
	"sap/m/QuickViewGroup",
	"sap/m/QuickViewGroupElement",
	"sap/m/Button",
	"jquery.sap.keycodes",
	"jquery.sap.global"
], function(
	qutils,
	JSONModel,
	mobileLibrary,
	App,
	Page,
	QuickView,
	QuickViewPage,
	QuickViewGroup,
	QuickViewGroupElement,
	Button,
	jQuery
) {
	// shortcut for sap.m.QuickViewGroupElementType
	var QuickViewGroupElementType = mobileLibrary.QuickViewGroupElementType;



	//create JSON model instance
	var oModel = new JSONModel();
	var oModelNoHeader = new JSONModel();
	// JSON sample data
	var mData = {
		"pages": [
			{
				pageId: "customPageId",
				header: "Employee Info",
				title: "John Doe",
				icon: "",
				description: "Department Manager1",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Other",
						elements: [
							{
								label: "Email",
								value: "john.dow@sap.com",
								url: "john.dow@sap.com",
								emailSubject: 'Subject',
								elementType: QuickViewGroupElementType.email
							},
							{
								label: "Name",
								value: "John Doe",
								elementType: "pageLink",
								pageLinkId: "companyEmployeePageId"
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: QuickViewGroupElementType.phone
							},
							{
								label: "Best Friend",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "Favorite Player",
								value: "Ivaylo Ivanov",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId3"
							}
						]
					}

				]
			},
			{
				pageId: "customPageId2",
				header: "Page 2",
				icon: "sap-icon://person-placeholder",
				title: "Michael Muller",
				description: "Account Manager",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Jaga",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId3",
				header: "Page 3",
				icon: "sap-icon://person-placeholder",
				title: "Ivaylo Ivanov",
				description: "Developer",
				groups: [
					{
						heading: "Job",
						elements: [
							{
								label: "Company",
								value: "SAP AG",
								url: "http://sap.com",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId4"
							},
							{
								label: "Company address",
								value: "Sofia, Boris III, 136A"
							}
						]
					},
					{
						heading: "Hobby",
						elements: [
							{
								label: "Name",
								value: "Table Tennis",
								elementType: "text"
							},
							{
								label: "Level",
								value: "Beginner"
							}

						]
					}

				]
			},
			{
				pageId: "customPageId4",
				header: "Company View",
				icon: "sap-icon://building",
				title: "SAP AG",
				description: "Run it simple",
				groups: [
					{
						heading: "Contact Information",
						elements: [
							{
								label: "Address",
								value: "Waldorf, Germany",
								url: "http://sap.com",
								elementType: "link"
							},
							{
								label: "Email",
								value: "office@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							}
						]
					},
					{
						heading: "Main Contact",
						elements: [
							{
								label: "Name",
								value: "Michael Muller",
								elementType: QuickViewGroupElementType.pageLink,
								pageLinkId: "customPageId2"
							},
							{
								label: "E-mail",
								value: "michael.muller@sap.com",
								emailSubject: 'Subject',
								elementType: "email"
							},
							{
								label: "Phone",
								value: "+359 888 888 888",
								elementType: "phone"
							},
							{
								label: "Mobile",
								value: "+359 888 999 999",
								elementType: "phone"
							}
						]
					}

				]
			}
		]

	};

	var mGenericDataNoHeader = {
		pages: [
			{
				pageId: "genericPageId",
				title: "Inventarisation",
				titleUrl: "http://de.wikipedia.org/wiki/Inventarisation",
				icon: "sap-icon://camera",
				groups: [
					{
						elements: [
							{
								label: "Start Date",
								value: "01/01/2015"
							},
							{
								label: "End Date",
								value: "31/12/2015"
							},
							{
								label: "Occurrence",
								value: "Weekly"
							}
						]
					}
				]
			}
		]
	};
	// set the data for the model
	oModel.setData(mData);
	oModelNoHeader.setData(mGenericDataNoHeader);

	var mDataNoActiveElements = {
		pages: [
			{
				pageId: "genericPageId",
				title: "Inventarisation",
				icon: "sap-icon://camera",
				groups: [
					{
						elements: [
							{
								label: "Start Date",
								value: "01/01/2015"
							},
							{
								label: "End Date",
								value: "31/12/2015"
							},
							{
								label: "Occurrence",
								value: "Weekly"
							}
						]
					}
				]
			}
		]
	};
	// set the data for the model
	var oModelNoActiveElements = new JSONModel();
	oModelNoActiveElements.setData(mDataNoActiveElements);

	// create and add app
	var oApp = new App("myApp", {initialPage: "quickViewPage"});
	oApp.placeAt("qunit-fixture");

	// create and add a page with icon tab bar
	var oPage = new Page("quickViewPage", {
		title: "Quick View"
	});
	oApp.addPage(oPage);

	function getQuickView() {
		return new QuickView({
			pages: {
				path: '/pages',
				template: new QuickViewPage({
					pageId: "{pageId}",
					header: "{header}",
					icon: "{icon}",
					title: "{title}",
					description: "{description}",
					groups: {
						path: 'groups',
						template: new QuickViewGroup({
							heading: '{heading}',
							elements: {
								path: 'elements',
								template: new QuickViewGroupElement({
									label: "{label}",
									value: "{value}",
									url: "{url}",
									type: "{elementType}",
									pageLinkId: "{pageLinkId}",
									emailSubject: '{emailSubject}'
								})
							}
						})
					}
				})
			}
		});
	}
	QUnit.module("API", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			oPage.addContent(this.oButton2);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Testing if the QuickView is created", function (assert) {
		assert.ok(sap.ui.getCore().byId(this.oQuickView.getId()), "should render");
	});

	QUnit.test("Test binding", function (assert) {
		var aQuickViewPages = this.oQuickView.getPages();

		aQuickViewPages.forEach(function (page, index) {
			assert.strictEqual(page.mProperties.header, mData.pages[index].header, "Header property is set correctly");
		});
	});

	QUnit.test("getQuickViewBase with QuickView parent", function (assert) {
		// Arrange
		var oQuickViewGroupElement = this.oQuickView.getPages()[0].getGroups()[0].getElements()[0];

		// Act
		var oQuickView = oQuickViewGroupElement.getQuickViewBase();

		// Assert
		assert.ok(oQuickView && oQuickView.isA("sap.m.QuickViewBase"), "Should return an instance of sap.m.QuickViewBase");
	});

	QUnit.test("getQuickViewBase without QuickView parent", function (assert) {
		// Arrange
		var oQuickViewGroupElement = new QuickViewGroupElement();
		var oQuickViewPage = new QuickViewPage({
			groups: [
				new QuickViewGroup({
					elements: [
						oQuickViewGroupElement
					]
				})
			]
		});

		// Act
		var oQuickView = oQuickViewGroupElement.getQuickViewBase();

		// Assert
		assert.notOk(oQuickView, "Should return null.");

		// Cleanup
		oQuickViewPage.destroy();
	});

	QUnit.module("Render", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Header is rendered", function (assert) {
		this.oButton.firePress();
		this.clock.tick(500);

		assert.strictEqual(jQuery(".sapMQuickViewPageWithoutHeader").length, 0, "QuickView has Header");
		assert.strictEqual(this.oQuickView._oPopover.$().attr("aria-describedby"), this.oQuickView._oNavContainer.getCurrentPage().getCustomHeader().getId(), "aria-describedby is correctly set");
	});

	QUnit.test("Clicking on a button to open a QuickView", function (assert) {
		var fnEventSpy = sinon.spy(this.oQuickView, "openBy");
		this.oButton.firePress();

		assert.strictEqual(fnEventSpy.callCount, 1, "Should call openBy() method");
	});

	QUnit.test("Losing focus after showing QuickView", function (assert) {
		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oQuickView._oPopover.isOpen(), "QuickView is already open");

		assert.ok(sap.ui.getCore().byId(this.oQuickView.getId()), "QuickView is rendered after it's opened.");
		assert.strictEqual(this.oQuickView._oPopover.$().is(':visible'), true, "QuickView is visible after it's opened.");

		this.oQuickView._oPopover.close();
		this.clock.tick(500);
		assert.strictEqual(this.oQuickView._oPopover.$().is(':visible'), false, "QuickView is not visible after it's closed.");
		assert.strictEqual(this.oQuickView._bRendered, false, "QuickView is marked as not rendered");
	});

	QUnit.test("Invalidating the button that is used in openBy", function (assert) {
		this.oButton.firePress();
		this.clock.tick(500);

		this.oButton.invalidate();
		assert.strictEqual(this.oQuickView._oPopover.$().is(':visible'), true, "Should not close the QuickView control.");
	});

	QUnit.test("Checking if all link have width of 'auto'", function(assert) {
		// act
		this.oButton.firePress();
		this.clock.tick(500);
		assert.ok(this.oQuickView._oPopover.isOpen(), "QuickView is already open");

		// assert
		var aLinks = this.oQuickView._oPopover.$().find(".sapMLnk");
		for (var index = 0; index < aLinks.length; index += 1) {
			assert.strictEqual(aLinks[index].style.width, 'auto', "The Link should have width set to 'auto'");
		}
	});

	QUnit.test("Test DOM ref", function(assert) {
		this.oQuickView.openBy(document.body);
		var oDomRef = this.oQuickView.getDomRef();

		assert.ok(oDomRef instanceof HTMLElement, "return value should be an instance of HTMLElement");
	});

	QUnit.test("Setting tooltip", function(assert) {
		var sTooltip = "Some tooltip";
		this.oQuickView.openBy(document.body);
		this.oQuickView.setTooltip(sTooltip);

		sap.ui.getCore().applyChanges();

		assert.strictEqual(this.oQuickView.getDomRef().getAttribute("title"), sTooltip, "Tooltip should be " + sTooltip);
	});

	QUnit.test("Setting busy state", function(assert) {
		this.oQuickView.openBy(document.body);
		this.oQuickView.setBusyIndicatorDelay(0);
		this.oQuickView.setBusy(true);

		sap.ui.getCore().applyChanges();

		assert.ok(this.oQuickView.getDomRef("busyIndicator"), "QuickView should have a busy indicator");
	});

	QUnit.test("Container height", function(assert) {
		// act
		this.oButton.firePress();
		this.clock.tick(500);

		var oPopupControl = this.oQuickView._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		assert.ok($container[0].style.height, "Container height is set");
	});

	QUnit.test("test focus", function(assert) {
		// act
		this.oButton.firePress();
		this.clock.tick(500);

		var oPopupControl = this.oQuickView._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPageEnableScrolling');

		assert.notEqual(document.activeElement, $container[0], "focus is not on the page scroller element");

		this.oQuickView.close();
		this.clock.tick(500);

		this.oQuickView.setModel(oModelNoActiveElements);

		this.oButton.firePress();
		this.clock.tick(500);

		$container = oPopupControl.$().find('.sapMPageEnableScrolling');

		assert.strictEqual(document.activeElement, $container[0], "focus is on the page scroller element");
	});

	QUnit.module("Keyboard handling", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();

		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Pressing the ESC key", function (assert) {
		var fnEventSpy = sinon.spy(this.oQuickView, "_onPopupKeyDown"),
			oPopupControl = this.oQuickView._oPopover.getAggregation("_popup");

		oPopupControl.addEventDelegate({
			onkeydown: fnEventSpy
		}, this.oQuickView);

		this.oButton.firePress();
		this.clock.tick(500);

		var $popover = this.oQuickView._oPopover.$();
		sap.ui.test.qunit.triggerKeydown($popover, jQuery.sap.KeyCodes.ESCAPE);

		assert.strictEqual(fnEventSpy.callCount, 1, "Should call the event handler.");
		assert.notEqual(this.oQuickView._oPopover.getId(), document.activeElement.id, "Should lose the focus from the QuickView");
		assert.strictEqual(this.oQuickView.isActive(), false, "Should close the QuickView");
	});

	QUnit.test("Check if Shift + Enter is handled", function (assert) {
		var fnEventSpy = sinon.spy(this.oQuickView._oNavContainer, "back"),
			done = assert.async();

		this.oButton.firePress();
		this.clock.tick(500);

		var currentPage = this.oQuickView._oNavContainer.getCurrentPage().getId(),
				pageToNavigate = this.oQuickView._oNavContainer.getPages()[1].getId();

		this.oQuickView._oNavContainer.to(pageToNavigate);
		this.clock.tick(500);

		var $popover = this.oQuickView._oPopover.$();
		sap.ui.test.qunit.triggerKeydown($popover, "ENTER", true, false, false);

		var newCurrentPage = this.oQuickView._oNavContainer.getCurrentPage().getId();

		assert.strictEqual(fnEventSpy.callCount, 1, "Should call the back() method of the nav container");
		assert.strictEqual(currentPage, newCurrentPage, "Should have returned to the first page");
		done();
	});

	QUnit.module("Change Data", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Change Page Header", function (assert) {
		this.oButton.firePress();

		this.clock.tick(500);

		var oTitle = jQuery('.sapMTitle').first();
		assert.strictEqual(oTitle.text(), 'Employee Info', 'Original text is correct');

		this.oQuickView.getModel().setProperty('/pages/0/header', 'New Header');

		this.clock.tick(500);

		oTitle = jQuery('.sapMTitle').first();
		assert.strictEqual(oTitle.text(), 'New Header', 'New text is correct');
	});

	QUnit.test("Change Page Group Element", function (assert) {
		this.oButton.firePress();

		this.clock.tick(500);

		var oText = jQuery('.sapUiRGLContainerCont .sapMText.sapMTextMaxWidth.sapUiSelectable').first();
		assert.strictEqual(oText.text(), 'Sofia, Boris III, 136A', 'Original text is correct');

		this.oQuickView.getModel().setProperty('/pages/0/groups/0/elements/1', {
			label: "Company address",
			value: "New Address"
		});

		this.clock.tick(500);

		oText = jQuery('.sapUiRGLContainerCont .sapMText.sapMTextMaxWidth.sapUiSelectable').first();
		assert.strictEqual(oText.text(), 'New Address', 'New text is correct');
	});

	QUnit.module("Navigate", {
		beforeEach: function () {
			this.oQuickView = getQuickView();
			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Test navOrigin parameter", function (assert) {
		this.oQuickView._setNavOrigin(this.oQuickView);

		assert.ok(this.oQuickView._navOrigin, "Setting the navOrigin parameter for QuickView.");
	});

	QUnit.module("Render: No Header QuickView", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModelNoHeader);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View No Header",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Test No Header Set", function (assert) {
		var aQuickViewPages = this.oQuickView.getPages();
		aQuickViewPages.forEach(function (page) {
			assert.strictEqual(page.mProperties.header, "", "Header property is not set");
		});
	});

	QUnit.test("Test No Header rendered", function (assert) {
		this.oButton.firePress();
		this.clock.tick(500);
		assert.strictEqual(jQuery(".sapMQuickViewPageWithoutHeader").length, 1, "QuickView has no header");
	});

	QUnit.test("Container height", function(assert) {
		// act
		this.oButton.firePress();
		this.clock.tick(500);

		var oPopupControl = this.oQuickView._oPopover.getAggregation("_popup");
		var $container = oPopupControl.$().find('.sapMPopoverCont');

		assert.notOk($container[0].style.height, "Container height is not set");
	});

	QUnit.module("Updating", {
		beforeEach: function () {
			this.oQuickView = getQuickView();

			this.oQuickView.setModel(oModelNoHeader);
			var that = this;
			this.oButton = new Button({
				text: "Open",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Remove page", function (assert) {

		assert.strictEqual(this.oQuickView.getPages().length, 1, 'page size is correct');

		this.oQuickView.removeAggregation('pages', this.oQuickView.getPages()[0]);

		assert.strictEqual(this.oQuickView.getPages().length, 0, 'page is removed');
	});

	QUnit.test("Invalidation", function (assert) {

		var fnQuickViewInvalidate = sinon.spy(this.oQuickView, "invalidate");
		var fnQuickViewPopoverInvalidate = sinon.spy(this.oQuickView._oPopover, "invalidate");

		this.oButton.firePress();

		var data = this.oQuickView.getModel().getData();
		data.pages.push({
			pageId: "newPageId",
			header: "New Page",
			title: "Page",
			icon: "",
			description: "Department Manager1",
			groups: [
				{
					heading: "Job",
					elements: [
						{
							label: "Company",
							value: "SAP AG",
							url: "http://sap.com",
							elementType: QuickViewGroupElementType.pageLink,
							pageLinkId: "customPageId4"
						},
						{
							label: "Company address",
							value: "Sofia, Boris III, 136A"
						}
					]
				}
			]
		});

		var newData = {};
		jQuery.extend(true, newData, data);

		this.oQuickView.getModel().setData(newData);

		assert.strictEqual(fnQuickViewInvalidate.callCount, 0, "QuickView.invalidate should not be called");
		assert.strictEqual(fnQuickViewPopoverInvalidate.callCount, 0, "QuickView.Popover.invalidate should not be called");
	});

	QUnit.test("InvalidationOfParentContainer", function (assert) {

		// the QuickView shouldn't be used as a child in any control,
		// but for historical reasons we need to handle this case
		oPage.addContent(this.oQuickView);

		var fnPageInvalidate = sinon.spy(oPage, "invalidate");

		var data = this.oQuickView.getModel().getData();
		data.pages.push({
			pageId: "newPageId",
			header: "New Page",
			title: "Page",
			icon: "",
			description: "Department Manager1",
			groups: [
				{
					heading: "Job",
					elements: [
						{
							label: "Company",
							value: "SAP AG",
							url: "http://sap.com",
							elementType: QuickViewGroupElementType.pageLink,
							pageLinkId: "customPageId4"
						},
						{
							label: "Company address",
							value: "Sofia, Boris III, 136A"
						}
					]
				}
			]
		});

		var newData = {};
		jQuery.extend(true, newData, data);

		this.oQuickView.getModel().setData(newData);

		this.oQuickView.getPages()[0].setTitle('New Title');

		assert.strictEqual(fnPageInvalidate.callCount, 0, "Page.invalidate should not be called");
	});

	QUnit.test("Element Property change", function (assert) {

		var fnQuickViewInvalidate = sinon.spy(this.oQuickView, "invalidate");
		var fnQuickViewPopoverInvalidate = sinon.spy(this.oQuickView._oPopover, "invalidate");

		this.oQuickView.getPages()[0].getGroups()[0].setHeading('new heading');

		assert.strictEqual(fnQuickViewInvalidate.callCount, 0, "QuickView.invalidate should not be called");
		assert.strictEqual(fnQuickViewPopoverInvalidate.callCount, 0, "QuickView.Popover.invalidate should not be called");
	});

	QUnit.module("Standalone QuickView elements", {
		beforeEach: function () {
			this.oQuickViewGroupElement = new QuickViewGroupElement();
			this.oQuickViewGroup = new QuickViewGroup();
			this.oQuickViewPage = new QuickViewPage();
		},
		afterEach: function () {
			this.oQuickViewGroupElement.destroy();
			this.oQuickViewGroupElement = null;
			this.oQuickViewGroup.destroy();
			this.oQuickViewGroup = null;
			this.oQuickViewPage.destroy();
			this.oQuickViewPage = null;
		}
	});

	QUnit.test("QuickViewGroupElement property change", function (assert) {
		// Arrange
		var fnInvalidate = sinon.spy(this.oQuickViewGroupElement, "invalidate");

		// Act
		this.oQuickViewGroupElement.setValue("test");

		// Assert
		assert.ok(fnInvalidate.calledOnce, "Property change should trigger invalidation for QuickViewGroupElement.");
	});

	QUnit.test("QuickViewGroup property change", function (assert) {
		// Arrange
		var fnInvalidate = sinon.spy(this.oQuickViewGroup, "invalidate");

		// Act
		this.oQuickViewGroup.setHeading("test");

		// Assert
		assert.ok(fnInvalidate.calledOnce, "Property change should trigger invalidation for QuickViewGroup.");
	});

	QUnit.test("QuickViewPage property change", function (assert) {
		// Arrange
		var fnInvalidate = sinon.spy(this.oQuickViewPage, "invalidate");

		// Act
		this.oQuickViewPage.setHeader("test");

		// Assert
		assert.ok(fnInvalidate.calledOnce, "Property change should trigger invalidation for QuickViewPage.");
	});

	QUnit.module("Navigate to next page", {
		beforeEach: function () {
			this.oQuickView = getQuickView();
			this.oQuickView.setModel(oModel);
			var that = this;
			this.oButton = new Button({
				text: "Open Quick View",
				press: function () {
					that.oQuickView.openBy(this);
				}
			});

			oPage.addContent(this.oButton);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oButton.destroy();
			this.oButton = null;

			this.oQuickView.destroy();
			this.oQuickView = null;
		}
	});

	QUnit.test("Test navigation with sap.m.QuickViewGroupElementType.pageLink", function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oButton.firePress();
		this.clock.tick(500);

		this.clock.restore(); // restore the timer so we can use the real setTimeout temporary

		var oLink = this.oQuickView.getPages()[0].getPageContent().form.getContent().find(function(item){
			return item.isA("sap.m.Link");
		});

		assert.notEqual(this.oQuickView._oPopover.getDomRef().getElementsByTagName("a")[2].href.slice(-1), "#", " href don't have unnecessary #");

		oLink.firePress();

		// Assert
		setTimeout(function(){
			assert.ok(this.oQuickView._oPopover.isOpen(), "After a link is clicked, the popup should stay opened with the content of the linked page.");
			done();
		}.bind(this), 1000);
	});
});