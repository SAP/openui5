describe("sap.m.SemanticPage", function() {

	var fnClickThenCompare = function (sId, sImageName, sTestMessage, bEnsureOverflowVisible) {
		it(sTestMessage, function () {

			if (bEnsureOverflowVisible) {
				fnEnsureOverflowVisible();
			}
			element(by.id(sId)).click();
			expect(takeScreenshot()).toLookAs(sImageName);
		});
	}

	var fnEnsureOverflowVisible = function() {
		var overflowBtn = element(by.id("detail-footer-overflowButton"));
		overflowBtn.isPresent().then(function(isPresent) {
			if(isPresent) {
				overflowBtn.click(); // we ensure that any buttons in overflow are also visible
			}
		})

	}

	it("Should load test page",function(){
		expect(takeScreenshot()).toLookAs("semantic-initial");
	});

	//messages indicator
	fnClickThenCompare("addMessagesBtn", "semantic-messages-indicator", "should show a messages indicator");
	fnClickThenCompare("clearMessagesBtn", "semantic-messages-cleared", "should not show a messages indicator");

	//draft indicator
	fnClickThenCompare("showDraftSavedBtn", "semantic-saved-draft", "should show a label for draft saved");
	fnClickThenCompare("clearDraftStateBtn", "semantic-draft-cleared", "should not show a draft label");

	//footer show/hide
	fnClickThenCompare("showHideFooterBtn", "semantic-no-footer", "should not show a page footer");
	fnClickThenCompare("showHideFooterBtn", "semantic-with-footer", "should show a page footer");

	//multiselect on/off databinding
	fnClickThenCompare("toggleMultiselectPressedBtn", "semantic-multiselect-by-databinding-on", "should show a multiselect-cancel button");
	fnClickThenCompare("toggleMultiselectPressedBtn", "semantic-multiselect-by-databinding-off", "should show a multiselect button");

	//multiselect enable/disable
	fnClickThenCompare("toggleMultiselectEnabledBtn", "semantic-multiselect-disabled", "should show a disabled multiselect button");
	fnClickThenCompare("toggleMultiselectEnabledBtn", "semantic-multiselect-enabled", "should show an enabled multiselect button");

	//multiselect on/off
	fnClickThenCompare("multiselectAction-toggleButton", "semantic-multiselect-on", "should show a multiselect-cancel button");
	fnClickThenCompare("multiselectAction-toggleButton", "semantic-multiselect-off", "should show a multiselect button");

	 //favorite on/off
	 fnClickThenCompare("favoriteAction-toggleButton", "semantic-favorite-on", "should show a favorite emphasized button", true);
	 fnClickThenCompare("favoriteAction-toggleButton", "semantic-favorite-off", "should show a favorite non-emphasized button", true);

	//flag on/off
	fnClickThenCompare("flagAction-toggleButton", "semantic-flag-on", "should show a flag emphasized button", true);
	fnClickThenCompare("flagAction-toggleButton", "semantic-flag-off", "should show a flag non-emphasized button", true);

	//sort select on/off
	fnClickThenCompare("sortSelect-select", "semantic-sort-select-options", "should open select options");
	fnClickThenCompare("sortSelect-select", "semantic-sort-select-no-options", "should hide select options");

	//stateless actions
	fnClickThenCompare("addAction-button", "semantic-add-action", "should trigger add action");
	fnClickThenCompare("filterAction-button", "semantic-filter-action", "should trigger filter action");
	fnClickThenCompare("groupAction-button", "semantic-group-action", "should trigger group action");
	fnClickThenCompare("mainAction-button", "semantic-main-action", "should trigger main action");
	fnClickThenCompare("editAction-button", "semantic-edit-action", "should trigger edit action");
	fnClickThenCompare("saveAction-button", "semantic-save-action", "should trigger save action");
	fnClickThenCompare("deleteAction-button", "semantic-delete-action", "should trigger delete action");
	fnClickThenCompare("positiveAction-button", "semantic-positive-action", "should trigger positive action");
	fnClickThenCompare("negativeAction-button", "semantic-negative-action", "should trigger negative action");
	fnClickThenCompare("cancelAction-button", "semantic-cancel-action", "should trigger cancel action", true);
	fnClickThenCompare("forwardAction-button", "semantic-forward-action", "should trigger forward action", true);

	//share menu
	fnClickThenCompare("detail-shareButton", "semantic-share-menu-expanded", "should expand the share menu");

});
