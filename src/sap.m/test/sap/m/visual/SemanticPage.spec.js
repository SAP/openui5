/*global describe,it,element,by,takeScreenshot,browser,expect*/

describe("sap.m.SemanticPage", function() {
	"use strict";

	browser.testrunner.currentSuite.meta.controlName = 'sap.m.semantic.SemanticPage';

	//const
	var _PAGE_TYPE = {
		"MASTER": "MASTER",
		"DETAIL": "DETAIL"
	},

	// mobile support help functions
	_showMenu = function() {
			browser.executeScript(function() {

				var bPhone = sap.ui.Device.system.phone,
				bTablet = sap.ui.Device.system.tablet,

				_showPhoneMenu = function() {
					sap.ui.getCore().byId("myApp").toMaster("menuPage"); //nav to menu-page
				},
				_showTabletMenu = function() {
					sap.ui.getCore().byId("semanticPageContainer").hideMaster();
					sap.ui.getCore().byId("myApp").showMaster();
				};

				if (bPhone) {
					_showPhoneMenu();
				} else if (bTablet) {
					_showTabletMenu();
				}

			}).then(function() {
				element(by.id("menuPage-title-inner")).click(); //wait for menu-page content to show
			});
	},

	_showPageType = function(sType) {

		browser.executeScript(function() {

			var bPhone = sap.ui.Device.system.phone,
				bTablet = sap.ui.Device.system.tablet,
				sPageType = arguments[0],

				showPageOnPhone = function() {
					sap.ui.getCore().byId("myApp").toDetail("semanticPageContainer"); //nav to semantic (master/detail) pages container

					if (sPageType === "MASTER") { //nav to requested (master/detail) semantic page type
						sap.ui.getCore().byId("semanticPageContainer").toMaster("master");
						return "master";
					} else if (sPageType === "DETAIL") {
						sap.ui.getCore().byId("semanticPageContainer").toDetail("detail");
						return "detail";
					}
				},

				showPageOnTablet = function() {
					sap.ui.getCore().byId("myApp").hideMaster();

					if (sPageType === "MASTER") {
						sap.ui.getCore().byId("semanticPageContainer").showMaster();
						return "master";
					} else if (sPageType === "DETAIL") {
						sap.ui.getCore().byId("semanticPageContainer").hideMaster();
						return "detail";
					}
				};

			if (bPhone) {
				return showPageOnPhone();
			} else if (bTablet) {
				return showPageOnTablet();
			}

		}, sType).then(function(sPageId) {
			if (sPageId) {
				element(by.id(sPageId + "-title-inner")).click(); //wait for page content to show
			}
		});
	},


	//help function called to ensure that any buttons in overflow are also visible
	fnEnsureOverflowVisible = function() {
		var overflowBtn = element(by.id("detail-footer-overflowButton"));
		overflowBtn.isPresent().then(function(isPresent) {
			if (isPresent) {
				overflowBtn.click(); // we ensure that any buttons in overflow are also visible
			}
		});
	},

	//general help function
	fnClickThenCompare = function (sId, sPageType, sImageName, sTestMessage) {
		it(sTestMessage, function () {

			_showMenu();
			element(by.id(sId)).click();

			//open semanticPage to test the outcome
			_showPageType(sPageType);

			expect(takeScreenshot()).toLookAs(sImageName);
		});
	};

	//general help function
	var fnClickOverflowButtonThenCompare = function (sId, sPageType, sImageName, sTestMessage) {
		it(sTestMessage, function () {

			_showMenu();

			//open semanticPage to test the outcome
			_showPageType(sPageType);
			fnEnsureOverflowVisible();

			element(by.id(sId)).click();

			expect(takeScreenshot()).toLookAs(sImageName);
		});
	};

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("initial");
	});

	//messages indicator
	fnClickThenCompare("addMessagesBtn", _PAGE_TYPE.DETAIL, "semantic-messages-indicator", "should show a messages indicator");
	fnClickThenCompare("clearMessagesBtn", _PAGE_TYPE.DETAIL, "semantic-messages-cleared", "should not show a messages indicator");

	//draft indicator
	fnClickThenCompare("showDraftSavedBtn", _PAGE_TYPE.DETAIL, "semantic-saved-draft", "should show a label for draft saved");
	fnClickThenCompare("clearDraftStateBtn", _PAGE_TYPE.DETAIL, "semantic-draft-cleared", "should not show a draft label");

	//footer show/hide
	fnClickThenCompare("showHideFooterBtn", _PAGE_TYPE.DETAIL, "semantic-detail-no-footer", "should not show a page footer");
	fnClickThenCompare("showHideFooterBtn", _PAGE_TYPE.DETAIL, "semantic-detail-with-footer", "should show a page footer");
	fnClickThenCompare("showHideFooterBtn", _PAGE_TYPE.MASTER, "semantic-master-no-footer", "should not show a page footer");
	fnClickThenCompare("showHideFooterBtn", _PAGE_TYPE.MASTER, "semantic-master-with-footer", "should show a page footer");

	//multiselect on/off databinding
	fnClickThenCompare("toggleMultiselectPressedBtn", _PAGE_TYPE.MASTER, "semantic-multiselect-by-databinding-on", "should show a multiselect-cancel button");
	fnClickThenCompare("toggleMultiselectPressedBtn", _PAGE_TYPE.MASTER, "semantic-multiselect-by-databinding-off", "should show a multiselect button");

	//multiselect enable/disable
	fnClickThenCompare("toggleMultiselectEnabledBtn", _PAGE_TYPE.MASTER, "semantic-multiselect-disabled", "should show a disabled multiselect button");
	fnClickThenCompare("toggleMultiselectEnabledBtn", _PAGE_TYPE.MASTER, "semantic-multiselect-enabled", "should show an enabled multiselect button");

	//multiselect on/off
	fnClickThenCompare("multiselectAction-toggleButton", _PAGE_TYPE.MASTER, "semantic-multiselect-on", "should show a multiselect-cancel button");
	fnClickThenCompare("multiselectAction-toggleButton", _PAGE_TYPE.MASTER, "semantic-multiselect-off", "should show a multiselect button");

	//favorite on/off
	fnClickOverflowButtonThenCompare("favoriteAction-toggleButton", _PAGE_TYPE.DETAIL, "semantic-favorite-on", "should show a favorite emphasized button");
	fnClickOverflowButtonThenCompare("favoriteAction-toggleButton", _PAGE_TYPE.DETAIL, "semantic-favorite-off", "should show a favorite non-emphasized button");

	//flag on/off
	fnClickOverflowButtonThenCompare("flagAction-toggleButton", _PAGE_TYPE.DETAIL, "semantic-flag-on", "should show a flag emphasized button");
	fnClickOverflowButtonThenCompare("flagAction-toggleButton", _PAGE_TYPE.DETAIL, "semantic-flag-off", "should show a flag non-emphasized button");

	//sort select on/off
	fnClickThenCompare("sortSelect-select", _PAGE_TYPE.MASTER, "semantic-sort-select-options", "should open select options");
	fnClickThenCompare("sortSelect-select", _PAGE_TYPE.MASTER, "semantic-sort-select-no-options", "should hide select options");

	//stateless actions
	fnClickThenCompare("addAction-button", _PAGE_TYPE.MASTER, "semantic-add-action", "should trigger add action");
	fnClickThenCompare("filterAction-button", _PAGE_TYPE.MASTER, "semantic-filter-action", "should trigger filter action");
	fnClickThenCompare("groupAction-button", _PAGE_TYPE.MASTER, "semantic-group-action", "should trigger group action");
	fnClickThenCompare("mainAction-button", _PAGE_TYPE.DETAIL, "semantic-main-action", "should trigger main action");
	fnClickThenCompare("editAction-button", _PAGE_TYPE.DETAIL, "semantic-edit-action", "should trigger edit action");
	fnClickThenCompare("saveAction-button", _PAGE_TYPE.DETAIL, "semantic-save-action", "should trigger save action");
	fnClickThenCompare("deleteAction-button", _PAGE_TYPE.DETAIL, "semantic-delete-action", "should trigger delete action");
	fnClickThenCompare("positiveAction-button", _PAGE_TYPE.DETAIL, "semantic-positive-action", "should trigger positive action");
	fnClickThenCompare("negativeAction-button", _PAGE_TYPE.DETAIL, "semantic-negative-action", "should trigger negative action");
	fnClickOverflowButtonThenCompare("cancelAction-button", _PAGE_TYPE.DETAIL, "semantic-cancel-action", "should trigger cancel action");
	fnClickOverflowButtonThenCompare("forwardAction-button", _PAGE_TYPE.DETAIL, "semantic-forward-action", "should trigger forward action");

	//share menu
	fnClickThenCompare("detail-shareButton", _PAGE_TYPE.DETAIL, "semantic-share-menu-expanded", "should expand the share menu");

});
