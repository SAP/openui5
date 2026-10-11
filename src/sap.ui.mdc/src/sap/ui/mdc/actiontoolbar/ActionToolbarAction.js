/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/mdc/actiontoolbar/ActionToolbarActionRenderer",
	"sap/ui/mdc/enums/ActionToolbarActionAlignment",
	"sap/ui/base/ManagedObjectObserver"
], (Control, ActionToolbarActionRenderer, ActionToolbarActionAlignment, ManagedObjectObserver) => {
	"use strict";

	/**
	 * @typedef {object} sap.ui.mdc.actiontoolbar.ActionToolbarActionLayoutInformation
	 * @property {string} aggregationName The name of the aggregation where the action is displayed. Currently only <code>end</code> is supported.
	 * @property {sap.ui.mdc.enums.ActionToolbarActionAlignment} alignment The alignment of the action defining if it's displayed before or after the aggregation.
	 * @public
	 */

	/**
	 * Constructor for a new ActionToolbarAction.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class
	 * The action for an {@link sap.ui.mdc.ActionToolbar ActionToolbar} control with given layout information that determines where the wrapped control is displayed on the <code>ActionToolbar</code>.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @version ${version}
	 * @constructor
	 * @since 1.58
	 * @public
	 * @alias sap.ui.mdc.actiontoolbar.ActionToolbarAction
	 */
	const ActionToolbarAction = Control.extend("sap.ui.mdc.actiontoolbar.ActionToolbarAction", {
		metadata: {
			library: "sap.ui.mdc",
			designtime: "sap/ui/mdc/designtime/actiontoolbar/ActionToolbarAction.designtime",
			interfaces: [
				"sap.m.IOverflowToolbarContent",
				"sap.m.IToolbarInteractiveControl"
			],
			properties: {
				/**
				 * Contains the information where the action is displayed on the <code>ActionToolbar</code>.
				 * The <code>layoutInformation</code> has to be of type {@link sap.ui.mdc.actiontoolbar.ActionToolbarActionLayoutInformation}.
				 */
				layoutInformation: {
					type: "object",
					defaultValue: {
						// available aggragation names: "beginning", "between", "end"
						aggregationName: "end",
						alignment: ActionToolbarActionAlignment.Begin
					}
				},
				/**
				 * Contains the label that is displayed in key user adaptation dialog.
				 * First fallback for this is the <code>text</code> property of the inner action aggregation.
				 * Second fallback for this is the <code>id</code> of this <code>ActionToolbarAction</code>.
				 * @ui5-restricted sap.fe
				 * @since 1.128
				 */
				label: {
					type: "string"
				}
			},
			defaultAggregation: "action",
			aggregations: {
				/**
				 * The control that is displayed on the <code>ActionToolbar</code>.
				 */
				action: {
					type: "sap.ui.core.Control",
					multiple: false
				}
			}
		},
		renderer: ActionToolbarActionRenderer
	});

	ActionToolbarAction.prototype.init = function() {
		this._oObserver = new ManagedObjectObserver(this.observeChanges.bind(this));
		this._oObserver.observe(this, {
			aggregations: ["action"]
		});
	};

	ActionToolbarAction.prototype.exit = function() {
		this._oObserver.disconnect();
		this._oObserver = undefined;
	};

	/**
	 * Observes changes in <code>Action</code> aggregation.
	 *
	 * @param {object} oChanges Changes
	 * @protected
	 */
	ActionToolbarAction.prototype.observeChanges = function(oChanges) {
		if (oChanges.name === "action") {
			const oAction = oChanges.child;
			if (oChanges.mutation === "insert") {
				this._oObserver.observe(oAction, {
					properties: ["visible"]
				});
				_updateSeparators(this.getParent());
			}
			if (oChanges.mutation === "remove") {
				this._oObserver.unobserve(oAction);
				_updateSeparators(this.getParent());
			}
		}
		if (oChanges.name === "visible") {
			_updateSeparators(this.getParent());
		}
	};

	ActionToolbarAction.prototype.getDomRef = function() {
		// return the DomRef of the inner Action, otherwise the Overflow calculation does not work
		return this.getAction() && this.getAction().getDomRef();
	};

	ActionToolbarAction.prototype.getFocusDomRef = function() {
		// return the FocusDomRef of the inner Action, so keybord navigation works correctly
		return this.getAction()?.getFocusDomRef();
	};

	ActionToolbarAction.prototype.getEnabled = function() {
		// If the toolbar (or any ancestor) is disabled, honour that first.
		// We must check the parent directly instead of relying on EnabledPropagator's hasDisabledAncestor,
		// because ActionToolbarAction itself now has getEnabled — so inner controls using EnabledPropagator
		// would stop their ancestor walk here and never reach the disabled toolbar.
		const oParent = this.getParent();
		if (oParent?.getEnabled && !oParent.getEnabled()) {
			return false;
		}
		// First check for usage of EnabledPropagator. If used, we need to get the enabled Property directly to prevent stack overflow
		if (this.getAction()?._bUseEnabledPropagator) {
			return this.getAction()?.getProperty("enabled");
		}
		return this.getAction()?.getEnabled?.() ?? true;
	};

	ActionToolbarAction.prototype.getLayoutData = function() {
		const oLayoutData = Control.prototype.getLayoutData.apply(this);
		// return the LayoutData of the inner Action if there is no LayoutData set
		return oLayoutData ? oLayoutData : this.getAction() && this.getAction().getLayoutData();
	};

	ActionToolbarAction.prototype.getOverflowToolbarConfig = function() {
		// use the Action OverflowToolbarConfig if exist
		const oConfig = this.getAction() && this.getAction().getOverflowToolbarConfig ? this.getAction().getOverflowToolbarConfig() : { canOverflow: true };
		oConfig.onBeforeEnterOverflow = this._getOnBeforeEnterOverflow(oConfig);
		oConfig.onAfterExitOverflow = this._getOnAfterExitOverflow(oConfig);
		return oConfig;
	};

	ActionToolbarAction.prototype._getOnBeforeEnterOverflow = function(oConfig) {
		const fnOnBeforeEnterOverflow = oConfig.onBeforeEnterOverflow;
		return function(oControl) {
			if (fnOnBeforeEnterOverflow) {
				fnOnBeforeEnterOverflow(oControl.getAction());
			}
			_updateSeparators(oControl.getParent());
		};
	};

	ActionToolbarAction.prototype._getOnAfterExitOverflow = function(oConfig) {
		const fnOnAfterExitOverflow = oConfig.onAfterExitOverflow;
		return function(oControl) {
			if (fnOnAfterExitOverflow) {
				fnOnAfterExitOverflow(oControl.getAction());
			}
			_updateSeparators(oControl.getParent());
		};
	};

	ActionToolbarAction.prototype._getToolbarInteractive = function() {
		return this.getAction()?._getToolbarInteractive?.() ?? false;
	};

	ActionToolbarAction.prototype.getLabel = function() {
		const sLabel = this.getProperty("label");
		if (sLabel) {
			return sLabel;
		}

		const oAction = this.getAction();
		return oAction && oAction.getText ? oAction.getText() : this.getId();
	};

	// Provide focus fail handling to set focus back on Additional Options button of ActionToolbar
	// SNOW: DINC0541991
	ActionToolbarAction.prototype.onfocusfail = function (oEvent) {
		this.getParent()?.onfocusfail(oEvent);
	};

	function _updateSeparators(oActionToolbar) {
		if (oActionToolbar?._updateSeparators) {
			oActionToolbar._updateSeparators();
		}
	}

	return ActionToolbarAction;
});