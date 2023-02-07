/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control", 	"sap/ui/fl/variants/VariantManagement", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/m/p13n/enum/PersistenceMode", "sap/ui/layout/VerticalLayout", "sap/ui/core/UIArea", "sap/ui/core/Core"
], function(CoreControl, VariantManagement, ControlVariantApplyAPI, mode, VerticalLayout, UIArea, Core) {
	"use strict";

	/**
	 * The <code>PersistenceProvider</code> control provides certain persistence capabilities, such as transient personalization and global persistence.
	 * The <code>PersistenceProvider</code> control can be used in a similar way as <code>sap.ui.fl.variants.VariantManagement</code>,
	 * since any control that is a direct or indirect descendant of the provided <code>for</code> association is affected by this configuration.
	 * For example, this controller can be used for <code>sap.ui.mdc</code> controls.
	 *
	 * @class
	 * @private
	 * @ui5-restricted sap.ui.mdc, sap.fe
	 *
	 * @since 1.104
	*/
	var PersistenceProvider = CoreControl.extend("sap.m.p13n.PersistenceProvider", /** @lends sap.ui.mdc.p13n.PersistenceProvider.prototype */ {
		metadata: {
			library: "sap.m",
			designtime: "sap/ui/mdc/designtime/p13n/PersistenceProvider.designtime",
			properties:  {
				/**
				 * Provides the mode setting for the <code>PersistenceProvider</code>.
				 * Allowed options are {@link sap.ui.mdc.enum.PersistenceMode}
				 */
				mode: {
					type: "sap.m.p13n.enum.PersistenceMode",
					group: "Data",
					defaultValue: mode.Auto
				}
			},
			associations: {
				/**
				 * Contains the controls for which the variant management is responsible.
				 */
				"for": {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		},
		renderer: {
			apiVersion: 2,
			render: function(oRm, oControl) {
				oRm.openStart("div", oControl);
				oRm.openEnd();
				oRm.close("div");
			}
		}
	});

	PersistenceProvider.prototype.init = function () {
		CoreControl.prototype.init.apply(this, arguments);
		this.attachModelContextChange(this._setModel, this);

		this._oModelPromise = new Promise(function (resolve, reject) {
			this._fnResolveModel = resolve;
		}.bind(this));
	};

	PersistenceProvider.prototype._setModel = function () {

		var oModel = this.getModel(ControlVariantApplyAPI.getVariantModelName());
		if (oModel) {
			this.reinitialize();
			this._fnResolveModel(oModel);
		}
	};

	PersistenceProvider.prototype.applySettings = function () {
		CoreControl.prototype.applySettings.apply(this, arguments);
		this._bmodeLocked = true;

		if (this.getMode() === mode.Transient) {
			var oVM = new VariantManagement(this.getId() + "--vm", {"for": this.getAssociation("for")});
			this._oModelPromise.then(function (oModel) {
				oVM.setModel(oModel, ControlVariantApplyAPI.getVariantModelName());
			});
			this._oWrapper = new VerticalLayout(this.getId() + "--accWrapper", {
				visible: true,
				content: [
					oVM
				]
			});

			this._oWrapper.onAfterRendering = function() {
				VerticalLayout.prototype.onAfterRendering.apply(this, arguments);
				this.getDomRef().setAttribute("aria-hidden", true);
			};

			var oStaticAreaRef = Core.getStaticAreaRef();
			var oStatic = UIArea.registry.get(oStaticAreaRef.id);
			oStatic.addContent(this._oWrapper, true);
			Core.createRenderManager().render(this._oWrapper, oStaticAreaRef);
		}

		return this;
	};

	PersistenceProvider.prototype.addFor = function (sControlId) {
		this.addAssociation("for", sControlId);

		var oVM = Core.byId(this.getId() + "--vm");
		if (this.getMode() === mode.Transient && oVM) {
			oVM.addFor(sControlId);
		}

		return this;
	};

	PersistenceProvider.prototype.removeFor = function (sControlId) {
		this.removeAssociation("for", sControlId);

		var oVM = Core.byId(this.getId() + "--vm");
		if (this.getMode() === mode.Transient && oVM) {
			oVM.removeFor(sControlId);
		}

		return this;
	};

	/**
	 * Set the mode for the <code>PersistenceProvider</code>.
	 *
	 * @override
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 */
	PersistenceProvider.prototype.setMode = function (sValue) {

		if (this._bmodeLocked && sValue !== this.getMode()) {
			throw new Error("mode is a final property.");
		}

		this.setProperty("mode", sValue);

		return this;
	};

	/**
	 * This method reinitializes the inner <code>VariantManagement</code> control be providing the
	 * variant model and triggering a reinitialize on the inner VM in the static area
	 *
	 * @ui5-restricted sap.m.p13n
	 */
	PersistenceProvider.prototype.reinitialize = function () {
		var oVM = Core.byId(this.getId() + "--vm");
		if (this.getMode() === mode.Transient && oVM) {
			var oVariantModel = this.getModel(ControlVariantApplyAPI.getVariantModelName());
			oVM.setModel(oVariantModel, ControlVariantApplyAPI.getVariantModelName());
			oVM.reinitialize();
		}
	};

	PersistenceProvider.prototype.exit = function () {
		if (this._oWrapper) {
			var oStatic = Core.getUIArea(Core.getStaticAreaRef());
			oStatic.removeContent(this._oWrapper);

			this._oWrapper.destroy();
			this._oWrapper = null;
		}

		this._oModelPromise = null;
		this._fnResolveModel = null;
		this._bmodeLocked = null;

		CoreControl.prototype.exit.apply(this, arguments);
	};

	return PersistenceProvider;
});