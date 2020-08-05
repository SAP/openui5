/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/util/hasTag",
	"sap/base/util/restricted/_omit"
], function (
	hasTag,
	_omit
) {
	"use strict";

	var mDefaultResponsiveGridLayout = {
		labelSpanXL: 4,
		labelSpanL: 4,
		labelSpanM: 4,
		labelSpanS: 12,
		adjustLabelSpan: false,
		columnsXL: 1,
		columnsL: 1,
		columnsM: 1,
		singleContainerFullSize: false
	};

	function createFormField(mPropertyEditorConfig) {
		return {
			label: mPropertyEditorConfig.label,
			value: mPropertyEditorConfig.value,
			config: _omit(mPropertyEditorConfig, ["label", "value"])
		};
	}

	function getConfigsByTag(aConfigs, aTags) {
		var aResult = [];
		var i = 0;

		while (i < aConfigs.length) {
			var mConfig = aConfigs[i];
			if (hasTag(mConfig, aTags)) {
				aResult.push(mConfig);
				aConfigs.splice(i, 1);
			} else {
				i++;
			}
		}

		return aResult;
	}

	function getConfigByName(aConfigs, sPropertyName) {
		var iIndex = aConfigs.findIndex(function (mConfig) {
			return mConfig.__propertyName === sPropertyName;
		});

		if (iIndex > -1) {
			return aConfigs.splice(iIndex, 1)[0];
		}
	}

	function isGroupVisible(aConfigs) {
		return aConfigs.some(function (mGroupConfig) {
			return typeof mGroupConfig.config.visible === "boolean" ? mGroupConfig.config.visible : true;
		});
	}

	/**
	 * Object declaration for property editor configuration.
	 *
	 * @typedef {object} sap.ui.integration.designtime.baseEditor.layout.Form.PropertyEditorConfig
	 * @since 1.77
	 * @private
	 * @ui5-restricted
	 * @property {string[]} tags - List of tags
	 * @property {string} path - Path where to get value from
	 * @property {string} [__propertyName] - Configuration name of the property
	 * @property {any} [value] - Current value of the property editor if any
	 */

	/**
	 * Group definition.
	 * Defines list of fields (property editors) which should be included in the group.
	 *
	 * @typedef {object} sap.ui.integration.designtime.baseEditor.layout.Form.Group
	 * @since 1.77
	 * @private
	 * @ui5-restricted
	 * @property {string} label - Label of the group. Can be i18n binding string.
	 * @property {sap.ui.integration.designtime.baseEditor.layout.Form.GroupItem[]} items - List of configuration items
	 */

	/**
	 * Group Item definition.
	 *
	 * @typedef {object} sap.ui.integration.designtime.baseEditor.layout.Form.GroupItem
	 * @since 1.77
	 * @private
	 * @ui5-restricted
	 * @property {('tag'|'propertyName')} type - Item type; can be tag or propertyName
	 * @property {string|string[]} value - Value of the item
	 */


	/**
	 * Prepares data for JSONModel which is then used by Form fragment.
	 *
	 * @function
	 * @since 1.77
	 * @private
	 * @alias module:sap/ui/integration/designtime/baseEditor/layout/Form
	 * @param {sap.ui.integration.designtime.baseEditor.layout.Form.PropertyEditorConfig[]} aPropertyEditorConfigs - List of property editors configurations
	 * @param {object} [mLayoutConfig] - Layout settings
	 * @param {sap.ui.integration.designtime.baseEditor.layout.Form.Group[]} [mLayoutConfig.groups] - List of configuration groups
	 * @param {object} [mLayoutConfig.responsiveGridLayout] - @see sap.ui.layout.form.ResponsiveGridLayout for the configuration options
	 * @param {boolean} [mLayoutConfig.renderLabels] - Default: true. Indicates whether form labels should be rendered
	 * @returns {object} Returns data in a convenient for the Form fragment format
	 */
	function prepareData (aPropertyEditorConfigs, mLayoutConfig) {
		mLayoutConfig = mLayoutConfig || {};
		var aConfigs = aPropertyEditorConfigs.slice();
		var aGroups = mLayoutConfig.groups || [];
		var mResponsiveGridLayout = mLayoutConfig.responsiveGridLayout || mDefaultResponsiveGridLayout;
		var bRenderLabels = mLayoutConfig.renderLabels !== false;
		var mViewModel = {
			responsiveGridLayout: mResponsiveGridLayout
		};

		if (!bRenderLabels) {
			aConfigs = aConfigs.map(function (mPropertyEditorConfig) {
				return _omit(mPropertyEditorConfig, "label");
			});
		}

		if (aGroups.length > 0) {
			mViewModel.groups = aGroups.map(function (mGroupConfig) {
				var aItems = [];

				mGroupConfig.items.forEach(function (mItemConfig) {
					switch (mItemConfig.type) {
						case "tag":
							aItems = aItems.concat(
								getConfigsByTag(aConfigs, mItemConfig.value)
									.map(function (mConfig) {
										return createFormField(mConfig);
									})
							);
							break;
						case "propertyName":
							var mPropertyEditorConfig = getConfigByName(aConfigs, mItemConfig.value);
							if (mPropertyEditorConfig) {
								aItems = aItems.concat(createFormField(mPropertyEditorConfig));
							}
							break;
					}
				});

				return {
					label: mGroupConfig.label,
					items: aItems,
					visible: isGroupVisible(aItems)
				};
			});
		} else {
			var aItems = aConfigs.splice(0, aConfigs.length).map(createFormField);
			mViewModel.groups = [{
				items: aItems,
				visible: isGroupVisible(aItems)
			}];
		}

		// Filter out empty groups
		mViewModel.groups = mViewModel.groups.filter(function (mGroup) {
			return mGroup.items.length > 0;
		});

		mViewModel.count = aPropertyEditorConfigs.length - aConfigs.length;

		return mViewModel;
	}

	return {
		prepareData: prepareData,
		updateDependencies: ["visible", "tags"]
	};
});
