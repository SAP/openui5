/*!
 * ${copyright}
 */

sap.ui.define([
	"./ListTypeBase",
	"sap/m/CustomListItem"
], (ListTypeBase, CustomListItem) => {
	"use strict";

	let InnerList;
	let InnerListItemAction;

	/**
	 * Constructor for a new <code>ListType</code>.
	 *
	 * @param {string} [sId] Optional ID for the new object; generated automatically if no non-empty ID is given
	 * @param {object} [mSettings] Initial settings for the new object
	 * @class The list type info class for the metadata-driven list wrapping a <code>sap.m.List</code>.
	 * @extends sap.ui.mdc.list.ListTypeBase
	 * @author SAP SE
	 * @ui5-restricted sap.fe
	 * @since 1.153
	 * @alias sap.ui.mdc.list.ListType
	 */
	const ListType = ListTypeBase.extend("sap.ui.mdc.list.ListType", {
		metadata: {
			library: "sap.ui.mdc",
			properties: {}
		}
	});

	/**
	 * Loads the <code>sap.m.List</code> module.
	 *
	 * @returns {Promise} A promise that resolves when the module is loaded
	 * @protected
	 */
	ListType.prototype.loadModules = function() {
		if (InnerList) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			sap.ui.require(["sap/m/List", "sap/m/ListItemAction"], (MList, MListItemAction) => {
				InnerList = MList;
				InnerListItemAction = MListItemAction;
				resolve();
			}, () => {
				reject(new Error("Failed to load sap/m/List"));
			});
		});
	};

	/**
	 * @override
	 * @protected
	 */
	ListType.prototype.getListSettings = function() {
		return {
			...ListTypeBase.prototype.getListSettings.apply(this, arguments),
			itemActionPress: [this._onItemActionPress, this]
		};
	};

	/**
	 * Creates the inner <code>sap.m.List</code> control.
	 *
	 * @returns {sap.m.List|null} The created list, or <code>null</code> if not ready
	 * @protected
	 */
	ListType.prototype.createList = function() {
		const oList = this.getList();

		if (!oList || !InnerList) {
			return null;
		}

		return new InnerList(this.getListSettings());
	};

	/**
	 * Wraps the application-provided content template in a <code>sap.m.CustomListItem</code>.
	 *
	 * @override
	 * @param {sap.ui.core.Control} oContentTemplate The application-provided content control
	 * @returns {sap.m.CustomListItem} A <code>CustomListItem</code> containing the content template
	 * @protected
	 */
	ListType.prototype.wrapItemTemplate = function(oContentTemplate) {
		oContentTemplate.addStyleClass("sapUiMdcListItemContent");
		return new CustomListItem({content: [oContentTemplate]}).addStyleClass("sapUiMdcListItem");
	};

	/**
	 * Applies item actions to the wrapper via <code>sap.m.ListItemAction</code> entries in the
	 * <code>actions</code> aggregation, consistent with how <code>ResponsiveTableType</code> handles
	 * row actions. At most one action is supported; additional static actions are ignored with a warning.
	 * The inner list gets <code>itemActionCount(1)</code> so the action column is reserved.
	 *
	 * @override
	 * @param {sap.m.CustomListItem} oWrapper The wrapper item
	 * @param {sap.ui.mdc.list.ItemSettings} oItemSettings The item settings
	 * @protected
	 */
	ListType.prototype.applyItemActions = function(oWrapper, oItemSettings) {
		const mActionsConfig = oItemSettings.getAllActions();
		const oInnerList = this.getInnerControl();

		// Bound actions path.
		if ("templateInfo" in mActionsConfig) {
			const mTemplateInfo = mActionsConfig.templateInfo;
			const oListItemAction = new InnerListItemAction({
				icon:    mTemplateInfo.icon,
				text:    mTemplateInfo.text,
				visible: mTemplateInfo.visible
			});

			oWrapper.bindAggregation("actions", {
				...mActionsConfig.items,
				template: oListItemAction,
				templateShareable: false
			});

			if (oInnerList) {
				oInnerList.setItemActionCount(oItemSettings.getEffectiveItemActionCount());
				oInnerList.bUseActionsForNavigation = true;
			}

			oWrapper.data("sap.ui.mdc.hasVisualItemActions", true);
			return;
		}

		// Static actions path.
		const aActions = mActionsConfig.items.filter((oAction) => oAction.getVisible());

		if (aActions.length === 0) {
			return;
		}

		aActions.forEach((oAction) => {
			const oListItemAction = new InnerListItemAction({
				icon:    oAction.isBound("icon")    ? oAction.getBindingInfo("icon")    : oAction.getIcon(),
				text:    oAction.isBound("text")    ? oAction.getBindingInfo("text")    : oAction.getText(),
				visible: oAction.isBound("visible") ? oAction.getBindingInfo("visible") : oAction.getVisible()
			});
			oListItemAction.data("sap.ui.mdc.itemActionItem", oAction);
			oWrapper.addAction(oListItemAction);
		});

		if (oInnerList) {
			oInnerList.setItemActionCount(oItemSettings.getEffectiveItemActionCount());
			oInnerList.bUseActionsForNavigation = true;
		}

		oWrapper.data("sap.ui.mdc.hasVisualItemActions", true);
	};

	/** @override */
	ListType.prototype.getStyleClasses = function() {
		return ["sapUiMdcListList"];
	};

	/**
	 * Re-applies item action rendering after an <code>ItemSettings</code> change.
	 * Destroys existing <code>ListItemAction</code> entries from the wrapper before
	 * delegating to <code>applyItemActions</code>.
	 *
	 * @override
	 * @protected
	 */
	ListType.prototype.updateItemActions = function() {
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

		oWrapper.unbindAggregation("actions");
		oWrapper.destroyActions();
		oWrapper.data("sap.ui.mdc.hasVisualItemActions", null);

		if (oInnerList.setItemActionCount) {
			oInnerList.setItemActionCount(-1);
			oInnerList.bUseActionsForNavigation = false;
		}

		const oItemSettings = oList.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		this.applyItemActions(oWrapper, oItemSettings);
	};

	/**
	 * Handles the <code>itemActionPress</code> event of the inner <code>sap.m.List</code> and fires
	 * the press event on the corresponding <code>ItemActionItem</code>.
	 *
	 * @param {sap.ui.base.Event} oEvent The itemActionPress event
	 * @private
	 */
	ListType.prototype._onItemActionPress = function(oEvent) {
		const oList = this.getList();
		const oInnerList = this.getInnerControl();

		if (!oList || !oInnerList) {
			return;
		}

		const oListItemAction = oEvent.getParameter("action");
		const oListItem = oEvent.getParameter("listItem");
		const sModelName = oInnerList.getBindingInfo("items")?.model;
		const oBindingContext = oListItem?.getBindingContext(sModelName);

		if (!oListItemAction || !oBindingContext) {
			return;
		}

		const oItemSettings = oList.getItemSettings();

		if (!oItemSettings) {
			return;
		}

		if (oItemSettings.isBound("itemActions")) {
			// Bound path: clone the template, set context, fire, then destroy.
			const oTemplate = oItemSettings.getBindingInfo("itemActions").template;
			const oActionClone = oTemplate.clone();
			oActionClone.setBindingContext(oBindingContext, sModelName);
			oActionClone._onPress({bindingContext: oBindingContext});
			oActionClone.destroy();
		} else {
			// Static path: retrieve the original ItemActionItem stored on the inner action.
			const oActionItem = oListItemAction.data("sap.ui.mdc.itemActionItem");
			if (oActionItem) {
				oActionItem._onPress({bindingContext: oBindingContext});
			}
		}
	};

	return ListType;
});
