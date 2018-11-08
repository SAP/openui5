/*!
 * ${copyright}
 */
/**
 * Adds support rules of the sap.m library to the support infrastructure.
 */
sap.ui.define([
	"sap/ui/support/library",
	"./rules/Breadcrumbs.support",
	"./rules/Button.support",
	"./rules/CheckBox.support",
	"./rules/DatePicker.support",
	"./rules/DateRangeSelection.support",
	"./rules/Dialog.support",
	"./rules/FacetFilter.support",
	"./rules/IconTabBar.support",
	"./rules/Image.support",
	"./rules/Input.support",
	"./rules/Link.support",
	"./rules/MaskInput.support",
	"./rules/MessagePage.support",
	"./rules/ObjectHeader.support",
	"./rules/ObjectListItem.support",
	"./rules/ObjectMarker.support",
	"./rules/ObjectStatus.support",
	"./rules/Panel.support",
	"./rules/Select.support",
	"./rules/SelectDialog.support",
	"./rules/StepInput.support",
	"./rules/Table.support",
	"./rules/Title.support",
	"./rules/Tokenizer.support",
	"./rules/ViewSettingsDialog.support"
],
	function(
		SupportLib,
		BreadcrumbsSupport,
		ButtonSupport,
		CheckBoxSupport,
		DatePickerSupport,
		DateRangeSelectionSupport,
		DialogSupport,
		FacetFilterSupport,
		IconTabBarSupport,
		ImageSupport,
		InputSupport,
		LinkSupport,
		MaskInputSupport,
		MessagePageSupport,
		ObjectHeaderSupport,
		ObjectListItemSupport,
		ObjectMarkerSupport,
		ObjectStatusSupport,
		PanelSupport,
		SelectSupport,
		SelectDialogSupport,
		StepInputSupport,
		TableSupport,
		TitleSupport,
		TokenizerSupport,
		ViewSettingsDialogSupport
	) {
	"use strict";

	return {
		name: "sap.m",
		niceName: "UI5 Main Library",
		ruleset: [
			BreadcrumbsSupport,
			ButtonSupport,
			CheckBoxSupport,
			DatePickerSupport,
			DateRangeSelectionSupport,
			DialogSupport,
			FacetFilterSupport,
			IconTabBarSupport,
			ImageSupport,
			InputSupport,
			LinkSupport,
			MaskInputSupport,
			MessagePageSupport,
			ObjectHeaderSupport,
			ObjectListItemSupport,
			ObjectMarkerSupport,
			ObjectStatusSupport,
			PanelSupport,
			SelectSupport,
			SelectDialogSupport,
			StepInputSupport,
			TableSupport,
			TitleSupport,
			TokenizerSupport,
			ViewSettingsDialogSupport
		]
	};

}, true);