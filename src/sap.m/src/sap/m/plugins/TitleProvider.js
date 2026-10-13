/*!
 * ${copyright}
 */
sap.ui.define(["./PluginBase",  "sap/ui/core/Element", "sap/ui/base/ManagedObjectObserver"], function(PluginBase, Element, ManagedObjectObserver) {
	"use strict";

	/**
	 * Constructor for a new <code>TitleProvider</code> plugin.
	 *
	 * @param {string} [sId] ID for the new <code>TitleProvider</code>, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the <code>TitleProvider</code>
	 *
	 * @class
	 * This plugin displays the total and selected row counts of its host control on the associated {@link sap.m.table.Title title} control.
	 *
	 * <b>Notes:</b>
	 * <ul>
	 *   <li>Supported host controls are <code>sap.m.Table</code> and <code>sap.ui.table.Table</code>.</li>
	 *   <li>The total row count is retrieved from the binding; unbound controls are not supported.</li>
	 *   <li>The <code>title</code> association is required and must be set in the constructor of the plugin.</li>
	 *   <li>
	 *     The {@link sap.m.table.Title#getTotalCount totalCount} and {@link sap.m.table.Title#getSelectedCount selectedCount} (if <code>manageSelectedCount</code>
	 *     is enabled) properties of the associated {@link sap.m.table.Title} control are managed by the plugin and must not be set by the application.
	 *   </li>
	 *   <li>
+	 *     For <code>sap.ui.table.Table</code>, the selected row count is only managed if a {@link sap.ui.table.plugins.SelectionPlugin selection plugin} is used.
	 *     If the selection plugin is replaced at runtime, the <code>TitleProvider</code> plugin must be registered again.
	 *   </li>
	 *   <li>
	 *     If the selected count might exceed the total row count (for example, if {@link sap.m.ListBase#getRememberSelection remember selection} is enabled and
	 *     the current filter hides previously selected rows), it is recommended to set the {@link sap.m.table.Title#getShowExtendedView showExtendedView} property
	 *     of the associated title control to <code>true</code>.
	 *     The plugin does not manage the <code>showExtendedView</code> property and leaves this to the application.
	 *   </li>
	 * </ul>
	 *
	 * @extends sap.ui.core.Element
	 * @author SAP SE
	 * @version ${version}
	 * @private
	 * @since 1.146
	 * @alias sap.m.plugins.TitleProvider
	 * @borrows sap.m.plugins.PluginBase.findOn as findOn
	 */
	const TitleProvider = PluginBase.extend("sap.m.plugins.TitleProvider", /** @lends sap.m.plugins.TitleProvider.prototype */ { metadata: {
		library: "sap.m",
		properties: {
			/**
			 * Determines whether the selected count is managed by the plugin.
			 */
			manageSelectedCount: { type: "boolean", defaultValue: true }
		},
		associations: {
			/**
			 * Defines the title control on which the total and selected row counts will be displayed.
			 */
			title: { type: "sap.m.table.Title", multiple: false }
		}
	}});

	TitleProvider.findOn = PluginBase.findOn;

	TitleProvider.prototype.onActivate = function(oControl) {
		this._oDelegate = { onAfterRendering: this._updateTitleAsync };
		oControl.addEventDelegate(this._oDelegate, this);

		if (this.getManageSelectedCount()) {
			this._attachSelectionChange(oControl);
		}

		const sBindingName = this.getConfig("bindingName");
		this._oObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
		this._oObserver.observe(oControl, { bindings: [sBindingName] });

		const oBinding = oControl.getBinding(sBindingName);
		if (oBinding) {
			this._toggleBindingEventListeners(oBinding, true);
			this._updateTitleAsync();
		}
	};

	TitleProvider.prototype.onDeactivate = function(oControl) {
		oControl.removeEventDelegate(this._oDelegate, this);
		this._oDelegate = null;

		if (this.getManageSelectedCount()) {
			this._detachSelectionChange(oControl);
		}

		this._oObserver.unobserve(oControl);
		this._oObserver.destroy();
		this._oObserver = null;

		const sBindingName = this.getConfig("bindingName");
		const oBinding = oControl.getBinding(sBindingName);
		if (oBinding) {
			this._toggleBindingEventListeners(oBinding, false);
		}

		const oTitle = this._getTitle();
		if (oTitle) {
			oTitle.setTotalCount();
			oTitle.setSelectedCount();
		}

		if (this._iUpdateTitleTimeout) {
			clearTimeout(this._iUpdateTitleTimeout);
			this._iUpdateTitleTimeout = undefined;
		}
	};

	TitleProvider.prototype.setManageSelectedCount = function(bManageSelectedCount) {
		const bActive = this.isActive();
		const oControl = this.getControl();
		if (bActive && oControl && this.getManageSelectedCount()) {
			this._detachSelectionChange(oControl);
		}

		this.setProperty("manageSelectedCount", bManageSelectedCount, true);

		if (bActive && oControl) {
			if (this.getManageSelectedCount()) {
				this._attachSelectionChange(oControl);
				this._updateTitleAsync();
			} else {
				const oTitle = this._getTitle();
				oTitle?.setSelectedCount();
			}
		}
		return this;
	};

	TitleProvider.prototype._toggleBindingEventListeners = function(oBinding, bAttach = false) {
		const fnMethod = bAttach ? "attachEvent" : "detachEvent";
		oBinding[fnMethod]("change", this._updateTitleAsync, this);
		oBinding[fnMethod]("createActivate", this._updateTitleAsync, this);
		oBinding[fnMethod]("createCompleted", this._updateTitleAsync, this);
	};

	TitleProvider.prototype._observeChanges = function(mChange) {
		const oBinding = mChange.bindingInfo.binding;
		if (!oBinding) {
			return;
		}

		const bBindingReady = mChange.mutation == "ready";
		this._toggleBindingEventListeners(oBinding, bBindingReady);
		if (bBindingReady) {
			this._updateTitleAsync();
		}
	};

	TitleProvider.prototype._updateTitle = function() {
		if (!this.isActive()) {
			return;
		}

		const oTitle = this._getTitle();
		const oControl = this.getControl();
		if (!oTitle || !oControl) {
			return;
		}

		const sBindingName = this.getConfig("bindingName");
		const oBinding = oControl.getBinding(sBindingName);

		// A suspended binding must not be queried for its count (e.g. ODataListBinding#getCount
		// throws when the root binding is suspended). Keep the current title until it resumes.
		if (oBinding?.getRootBinding?.()?.isSuspended()) {
			return;
		}

		const iTotalCount = oBinding ? oBinding.getCount() ?? -1 : undefined;
		oTitle.setTotalCount(iTotalCount);

		if (oBinding && this.getManageSelectedCount()) {
			const iSelectedCount = this.getConfig("getSelectedCount", oControl) ?? -1;
			oTitle.setSelectedCount(iSelectedCount);
		}
	};

	TitleProvider.prototype._updateTitleAsync = function() {
		clearTimeout(this._iUpdateTitleTimeout);
		this._iUpdateTitleTimeout = setTimeout(() => {
			this._updateTitle();
		});
	};

	TitleProvider.prototype._attachSelectionChange = function(oControl) {
		this.getConfig("attachSelectionChange", oControl, this._updateTitleAsync, this);
	};

	TitleProvider.prototype._detachSelectionChange = function(oControl) {
		this.getConfig("detachSelectionChange", oControl, this._updateTitleAsync, this);
	};

	TitleProvider.prototype._getTitle = function() {
		return Element.getElementById(this.getTitle());
	};


	/**
	 * Plugin-specific control configurations.
	 */
	PluginBase.setConfigs({
		"sap.m.ListBase": {
			bindingName: "items",
			attachSelectionChange(oList, fnHandler, oListener) {
				oList.attachEvent("itemSelectedChange", fnHandler, oListener);
			},
			detachSelectionChange(oList, fnHandler, oListener) {
				oList.detachEvent("itemSelectedChange", fnHandler, oListener);
			},
			getSelectedCount(oList) {
				return oList._getSelectionCount();
			}
		},
		"sap.ui.table.Table": {
			bindingName: "rows",
			_getSelectionPlugin(oTable) {
				return PluginBase.getPlugin(oTable, "sap.ui.table.plugins.SelectionPlugin");
			},
			attachSelectionChange(oTable, fnHandler, oListener) {
				this._getSelectionPlugin(oTable)?.attachSelectionChange(fnHandler, oListener);
			},
			detachSelectionChange(oTable, fnHandler, oListener) {
				this._getSelectionPlugin(oTable)?.detachSelectionChange(fnHandler, oListener);
			},
			getSelectedCount(oTable) {
				return this._getSelectionPlugin(oTable)?.getSelectedCount();
			}
		}
	}, TitleProvider);

	return TitleProvider;
});