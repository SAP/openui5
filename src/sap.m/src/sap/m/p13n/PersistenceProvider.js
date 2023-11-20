/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/core/Control", 	"sap/m/p13n/enum/PersistenceMode"
], function(CoreControl, mode) {
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
			designtime: "sap/m/designtime/PersistenceProvider.designtime",
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

	PersistenceProvider.prototype.applySettings = function () {
		CoreControl.prototype.applySettings.apply(this, arguments);
		this._bmodeLocked = true;
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

	PersistenceProvider.prototype.exit = function () {
		this._bmodeLocked = null;

		CoreControl.prototype.exit.apply(this, arguments);
	};

	return PersistenceProvider;
});