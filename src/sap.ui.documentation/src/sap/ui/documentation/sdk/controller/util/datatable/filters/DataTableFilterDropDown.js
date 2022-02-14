/*!
 * ${copyright}
 */

sap.ui.define(
	[
		'sap/ui/core/Control',
		'./DataTableFilterDropDownRenderer'
	], function (
		Control,
		DataTableFilterDropDownRenderer
	) {
	"use strict";

	var DataTableFilterDropDown = Control.extend("sap.ui.documentation.sdk.DataTableFilterDropDown", /** @lends sap.m.delegate.DateNavigation.prototype */ {
		metadata: {
			properties: {
				checked: { type: "array", defaultValue: [] },
				options: { type: "array", defaultValue: [] },
				expanded: { type: "boolean", defaultValue: false, visibility: "hidden"}
			}
		},
		renderer: DataTableFilterDropDownRenderer
	});

	DataTableFilterDropDown.M_EVENTS = {
		CHANGE: 'change'
	};

	DataTableFilterDropDown.isCheckbox = function (oTarget) {
		return oTarget.tagName.toLowerCase() === 'input' &&
			oTarget.type === 'checkbox';
	};

	DataTableFilterDropDown.prototype.setAll = function (bValue) {
		var aChecked = this.getChecked();

		for (var i = 0; i < aChecked.length; i++) {
			aChecked[i].value = bValue;
			this.optionsList.find('input[index=' + i + ']').prop('checked', bValue);
		}

		this.setChecked(aChecked, true);
	};

	DataTableFilterDropDown.prototype.init = function () {
		this.setChecked([]);
	};

	DataTableFilterDropDown.prototype.onBeforeRendering = function () {
		var aChecked = this.getChecked(),
			aOptions;

		if (aChecked.length === 0) {
			aOptions = this.getOptions();
			for (var index = 0; index < aOptions.length; index++) {
				aChecked[index] = { text: aOptions[index], value: false };
			}

			this.setChecked(aChecked, true);
		}

		this.detachEvents();
	};

	DataTableFilterDropDown.prototype.onAfterRendering = function () {
		this.cacheElements();
		this.attachEvents();
	};

	DataTableFilterDropDown.prototype.cacheElements = function () {
		this.filterBtn = this.$('filterBtn');
		this.optionsList = this.$('optionsList');
	};

	DataTableFilterDropDown.prototype.detachEvents = function () {
		if (this.filterBtn) {
			this.filterBtn.off('click');
		}
		if (this.optionsList) {
			this.optionsList.off('click');
		}
	};

	DataTableFilterDropDown.prototype.attachEvents = function () {
		this.filterBtn.on('click', function () {
			this.setProperty("expanded", !this.getProperty("expanded"));
		}.bind(this));

		this.optionsList.on('click', this.onClick.bind(this));
	};

	DataTableFilterDropDown.prototype.onsapfocusleave = function(oEvent) {
		this.setProperty("expanded", false);
	};

	DataTableFilterDropDown.prototype.onClick = function (oEvent) {
		var sIndex,
			aChecked = this.getChecked(),
			oTarget = oEvent.target,
			bIsCheckbox = DataTableFilterDropDown.isCheckbox(oTarget),
			bShouldSelectAll = oTarget.classList.contains("selectAll"),
			bShoudClearAll = oTarget.classList.contains("clearFilter"),
			bShouldFireChangeEvent = bIsCheckbox || bShouldSelectAll || bShoudClearAll;

		if (bIsCheckbox) {
			sIndex = oTarget.getAttribute('index');
			aChecked[sIndex].value = oEvent.target.checked;

			this.setProperty("checked", aChecked, true);
		} else if (bShouldSelectAll) {
			this.setAll(true, false);
		} else if (bShoudClearAll) {
			this.setAll(false, false);
		}

		if (bShouldFireChangeEvent) {
			this.fireEvent('change', { value: aChecked });
		}

	};

	DataTableFilterDropDown.prototype.getDefaultOptions = function (oEvent) {
		return [
			{
				text: "Clear Filter",
				key: "clearFilter"
			},
			{
				text: "Select All",
				key: "selectAll"
			}
		];
	};

	return DataTableFilterDropDown;
});