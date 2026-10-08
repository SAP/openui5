/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListTypeBase",
	"sap/m/Button",
	"sap/m/HBox",
	"sap/ui/core/Lib",
	"sap/base/Log"
], (ListTypeBase, Button, HBox, Library, Log) => {
	"use strict";

	let InnerGridList;
	let InnerGridListItem;
	let GridBoxLayout;

	/**
	 * Constructor for a new <code>GridListType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The list type info class for the metadata-driven list wrapping a <code>sap.f.GridList</code>.
	 *
	 * <b>Note:</b> The layout configuration of the grid (for example, the way item cards are sized and
	 * distributed across rows) is subject to change. The set of layout properties and their behavior may
	 * be extended or adjusted in future releases.
	 *
	 * @extends sap.ui.mdc.list.ListTypeBase
	 * @author SAP SE
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.GridListType
	 */
	const GridListType = ListTypeBase.extend("sap.ui.mdc.list.GridListType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Defines the minimum width of each grid list item card.
				 * The value is passed to the <code>sap.ui.layout.cssgrid.GridBoxLayout</code> as <code>boxMinWidth</code>.
				 *
				 * <b>Note:</b> When <code>boxWidth</code> is set, this property has no effect.
				 *
				 * @see sap.ui.layout.cssgrid.GridBoxLayout#boxMinWidth
				 */
				boxMinWidth: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: "16rem"},
				/**
				 * Defines the width of each grid list item card.
				 * The value is passed to the <code>sap.ui.layout.cssgrid.GridBoxLayout</code> as <code>boxWidth</code>.
				 *
				 * <b>Note:</b> When this property is set, <code>boxMinWidth</code> has no effect.
				 *
				 * @see sap.ui.layout.cssgrid.GridBoxLayout#boxWidth
				 */
				boxWidth: {type: "sap.ui.core.CSSSize", group: "Appearance", defaultValue: ""},
				/**
				 * Defines the number of grid list item cards per row for extra large, large, medium, and small screens.
				 * The value is passed to the <code>sap.ui.layout.cssgrid.GridBoxLayout</code> as <code>boxesPerRowConfig</code>.
				 *
				 * <b>Note:</b> This property has no effect when <code>boxMinWidth</code> or <code>boxWidth</code> is set.
				 *
				 * @see sap.ui.layout.cssgrid.GridBoxLayout#boxesPerRowConfig
				 */
				boxesPerRowConfig: {type: "sap.ui.layout.BoxesPerRowConfig", group: "Behavior", defaultValue: "XL7 L6 M4 S2"}
			}
		}
	});

	/**
	 * Loads the <code>sap.f.GridList</code> module.
	 *
	 * @returns {Promise} A promise that resolves when the module is loaded
	 * @protected
	 */
	GridListType.prototype.loadModules = function() {
		if (InnerGridList && InnerGridListItem && GridBoxLayout) {
			return Promise.resolve();
		}

		return Promise.all([
			Library.load({name: "sap.f"}),
			Library.load({name: "sap.ui.layout"})
		]).then(() => new Promise((resolve, reject) => {
			sap.ui.require(["sap/f/GridList", "sap/f/GridListItem", "sap/ui/layout/cssgrid/GridBoxLayout"], (GridList, GridListItem, BoxLayout) => {
				InnerGridList = GridList;
				InnerGridListItem = GridListItem;
				GridBoxLayout = BoxLayout;
				resolve();
			}, () => {
				reject(new Error("Failed to load sap/f/GridList"));
			});
		}));
	};

	/**
	 * @override
	 * @protected
	 */
	GridListType.prototype.getListSettings = function() {
		return {
			...ListTypeBase.prototype.getListSettings.apply(this, arguments),
			customLayout: new GridBoxLayout({
				boxMinWidth: this.getBoxMinWidth(),
				boxWidth: this.getBoxWidth(),
				boxesPerRowConfig: this.getBoxesPerRowConfig()
			})
		};
	};

	/**
	 * Creates the inner <code>sap.f.GridList</code> control.
	 *
	 * @returns {sap.f.GridList|null} The created GridList, or <code>null</code> if not ready
	 * @protected
	 */
	GridListType.prototype.createList = function() {
		const oList = this.getList();

		if (!oList || !InnerGridList) {
			return null;
		}

		return new InnerGridList(this.getListSettings());
	};

	/**
	 * @override
	 * @protected
	 */
	GridListType.prototype.updateListByProperty = function(sProperty, vValue) {
		const oLayout = this.getInnerControl()?.getCustomLayout();
		if (sProperty === "boxMinWidth") {
			oLayout?.setBoxMinWidth(vValue);
		} else if (sProperty === "boxWidth") {
			oLayout?.setBoxWidth(vValue);
		} else if (sProperty === "boxesPerRowConfig") {
			oLayout?.setBoxesPerRowConfig(vValue);
		}
	};

	/**
	 * Wraps the application-provided content template in a <code>sap.f.GridListItem</code>.
	 *
	 * @override
	 * @param {sap.ui.core.Control} oContentTemplate The application-provided content control
	 * @returns {sap.f.GridListItem} A <code>GridListItem</code> containing the content template
	 * @protected
	 */
	GridListType.prototype.wrapItemTemplate = function(oContentTemplate) {
		return new InnerGridListItem({content: [oContentTemplate]});
	};

	/**
	 * Applies visual item actions to the wrapper via an <code>HBox</code> inserted into the item content.
	 * At most two actions are recommended per Fiori guidelines.
	 * When the <code>actions</code> aggregation is bound, the individual action properties (<code>icon</code>,
	 * <code>text</code>, <code>enabled</code>, <code>visible</code>) from the binding template are forwarded
	 * to the corresponding <code>Button</code> properties so that per-row values update without a rebind.
	 *
	 * @override
	 * @param {sap.f.GridListItem} oWrapper The wrapper item
	 * @param {sap.ui.mdc.list.ItemSettings} oItemSettings The item settings
	 * @param {string} [sModelName] The binding model name
	 * @protected
	 */
	GridListType.prototype.applyItemActions = function(oWrapper, oItemSettings, sModelName) {
		const mActionsConfig = oItemSettings.getAllActions();

		// Bound actions path — use templateInfo extracted by getAllActions().
		if ("templateInfo" in mActionsConfig) {
			const mTemplateInfo = mActionsConfig.templateInfo;
			const oActionsContainer = new HBox({
				justifyContent: "End",
				renderType: "Bare"
			}).addStyleClass("sapUiMdcListItemActions");

			// A single button whose properties are driven entirely by the binding template.
			oActionsContainer.addItem(new Button({
				type: "Transparent",
				icon: mTemplateInfo.icon,
				tooltip: mTemplateInfo.text,
				visible: mTemplateInfo.visible,
				press: function(oEvent) {
					oEvent.cancelBubble();
					const oBindingContext = oEvent.getSource().getBindingContext(sModelName);
					const oActionsBinding = oWrapper.data("sap.ui.mdc.itemActionsBindingInfo");
					const oActionTemplate = oActionsBinding?.items?.template;

					if (!oActionTemplate || !oBindingContext) {
						return;
					}

					const oAction = oActionTemplate.clone();
					oAction.setBindingContext(oBindingContext, oActionsBinding.items.model);
					oAction._onPress({bindingContext: oBindingContext});
					oAction.destroy();
				}
			}));

			// Setting type to DetailAndActive ensures GridListItemRenderer always renders
			// the toolbar div (.sapFGLIToolbar) regardless of the list's selection mode, so
			// the absolutely-positioned actions container has a proper visual anchor and the
			// separator line is always shown. The native detail button produced by DetailAndActive
			// is hidden via CSS (.sapUiMdcListGridList .sapFGLI .sapMLIBIconDet).
			oWrapper.setType("DetailAndActive");
			oWrapper.data("sap.ui.mdc.itemActionsBindingInfo", mActionsConfig);
			oWrapper.data("sap.ui.mdc.hasVisualItemActions", true);
			oWrapper.addContent(oActionsContainer);
			// Override the announcement to use the CSS class selector because the HBox is a
			// binding template whose ID does not match the rendered item's ID-suffix pattern
			// that ListItemBase._getCustomActionsAnnouncement() relies on.
			oWrapper._getCustomActionsAnnouncement = function(bAnnounceEmpty) {
				const $Container = this.$().find(".sapUiMdcListItemActions");
				const iCount = $Container.length ? $Container.find(":sapTabbable").length : 0;
				if (!iCount && !bAnnounceEmpty) {
					return "";
				}
				const aBundleKeys = ["CONTROL_EMPTY", "LIST_ITEM_SINGLE_ACTION", "LIST_ITEM_MULTIPLE_ACTIONS"];
				return Library.getResourceBundleFor("sap.m").getText(aBundleKeys[Math.min(iCount, 2)], [iCount]);
			};
			return;
		}

		// Static actions path.
		const aActions = mActionsConfig.items.filter((oAction) => oAction.isBound("visible") || oAction.getVisible());

		if (aActions.length === 0) {
			return;
		}

		const iStaticVisible = aActions.filter((oAction) => !oAction.isBound("visible")).length;
		if (iStaticVisible > 2) {
			Log.warning(
				"sap.ui.mdc.List: More than 2 item actions are configured. Per Fiori guidelines, offer only 1 or 2 actions per item.",
				null,
				"sap.ui.mdc.List"
			);
		}

		const oActionsContainer = new HBox({
			justifyContent: "End",
			renderType: "Bare"
		}).addStyleClass("sapUiMdcListItemActions");

		aActions.forEach((oAction) => {
			const oActionClone = oAction.clone();
			const mVisible = oAction.isBound("visible") ? oActionClone.getBindingInfo("visible") : oAction.getVisible();
			oActionClone.destroy();

			oActionsContainer.addItem(new Button({
				type: "Transparent",
				icon: oAction.getIcon(),
				tooltip: oAction.getText(),
				visible: mVisible,
				press: function(oEvent) {
					oEvent.cancelBubble();
					const oBindingContext = oEvent.getSource().getBindingContext(sModelName);
					oAction._onPress({bindingContext: oBindingContext});
				}
			}));
		});

		oWrapper.setType("DetailAndActive");
		oWrapper.data("sap.ui.mdc.hasVisualItemActions", true);
		oWrapper.addContent(oActionsContainer);
		// Override the announcement to use the CSS class selector because the HBox is a
		// binding template whose ID does not match the rendered item's ID-suffix pattern
		// that ListItemBase._getCustomActionsAnnouncement() relies on.
		oWrapper._getCustomActionsAnnouncement = function(bAnnounceEmpty) {
			const $Container = this.$().find(".sapUiMdcListItemActions");
			const iCount = $Container.length ? $Container.find(":sapTabbable").length : 0;
			if (!iCount && !bAnnounceEmpty) {
				return "";
			}
			const aBundleKeys = ["CONTROL_EMPTY", "LIST_ITEM_SINGLE_ACTION", "LIST_ITEM_MULTIPLE_ACTIONS"];
			return Library.getResourceBundleFor("sap.m").getText(aBundleKeys[Math.min(iCount, 2)], [iCount]);
		};
	};

	/**
	 * Re-applies item action rendering after an <code>ItemSettings</code> change.
	 * Removes the previously rendered actions <code>HBox</code> from the wrapper content before
	 * delegating to <code>applyItemActions</code>.
	 *
	 * @override
	 * @protected
	 */
	GridListType.prototype.updateItemActions = function() {
		const oInnerList = this.getInnerControl();
		const oList = this.getList();

		if (!oInnerList || !oList) {
			return;
		}

		const oBindingInfo = oInnerList.getBindingInfo("items");
		const oWrapper = oBindingInfo?.template;

		if (!oWrapper) {
			return;
		}

		// Remove the previously rendered actions container (last content item with the marker CSS class).
		const aContent = oWrapper.getContent();
		const oOldContainer = aContent.find((oControl) => oControl.hasStyleClass?.("sapUiMdcListItemActions"));
		if (oOldContainer) {
			oWrapper.removeContent(oOldContainer);
			oOldContainer.destroy();
		}

		oWrapper.setType("Inactive");
		oWrapper.data("sap.ui.mdc.hasVisualItemActions", null);
		oWrapper.data("sap.ui.mdc.itemActionsBindingInfo", null);
		delete oWrapper._getCustomActionsAnnouncement;

		const oItemSettings = oList.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		const sModelName = oInnerList.getBindingInfo("items")?.model;
		this.applyItemActions(oWrapper, oItemSettings, sModelName);
	};

	/**
	 * @override
	 * @protected
	 */
	GridListType.prototype.getStyleClasses = function() {
		return ["sapUiMdcListGridList"];
	};

	return GridListType;
});
