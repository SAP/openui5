/*!
 * ${copyright}
 */

sap.ui.define(["sap/base/strings/capitalize"], (capitalize) => {
	"use strict";

	/**
	 * Enhances a given control prototype to manage a set of aggregations that are stored locally and forwarded to an
	 * on-demand, replaceable target (for example the inner control of a composite control). How each value is
	 * applied to the target is defined per aggregation via an <code>applyToTarget</code> callback, keeping this mixin control-agnostic.
	 *
	 * Only 0..1 (singular) aggregations are supported.
	 *
	 * For each aggregation the mixin installs the following:
	 * <ul>
	 * <li><code>set&lt;Agg&gt;(v)</code> - stores the value and, once a target has been registered, forwards it (see below)</li>
	 * <li><code>get&lt;Agg&gt;()</code> - returns the stored value (or <code>null</code> if destroyed)</li>
	 * <li><code>destroy&lt;Agg&gt;()</code> - destroys and nulls the stored value</li>
	 * </ul>
	 *
	 * <b>Deferred forwarding.</b> A stored value is only forwarded to a target if a target is registered.
	 * Setting a value before the first {@link #_registerForwardingTarget} call stores it without invoking
	 * <code>applyToTarget</code>; the value is forwarded when the target registers. This guarantees that
	 * <code>applyToTarget</code> only runs when a target exists, so implementations do not need to check for a
	 * missing target.
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @alias sap.ui.mdc.mixin.DeferredAggregationForwardMixin
	 * @namespace
	 * @since 1.154
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 */
	const DeferredAggregationForwardMixin = {};

	const MIXIN_SYMBOL = Symbol("DeferredAggregationForwardMixin");

	DeferredAggregationForwardMixin.init = function(fnInit, aAggregations) {
		return function() {
			this[MIXIN_SYMBOL] = {aggregations: aAggregations, targetRegistered: false};

			if (fnInit) {
				fnInit.apply(this, arguments);
			}
		};
	};

	DeferredAggregationForwardMixin.exit = function(fnExit) {
		return function() {
			const oState = this[MIXIN_SYMBOL];

			for (const {sAggregationName} of oState.aggregations) {
				oState[sAggregationName]?.destroy?.();
				delete oState[sAggregationName];
			}

			if (fnExit) {
				fnExit.apply(this, arguments);
			}
		};
	};

	/**
	 * Registers the target that stored aggregation values are forwarded to, and forwards everything stored so far.
	 *
	 * Calling this marks a target as present: from now on <code>set&lt;Agg&gt;</code> forwards immediately, and every stored
	 * value is forwarded now by calling <code>applyToTarget(value)</code> once per aggregation that holds a value.
	 * The target's <code>exit</code> is wrapped so that, when the target is destroyed, <code>applyToTarget(undefined)</code>
	 * is called for each such aggregation and the mixin reverts to the deferred state - subsequent sets store without
	 * forwarding until a new target is registered (for example after a target is recreated on a type switch).
	 *
	 * @param {sap.ui.core.Element} oTarget The target to forward stored aggregation values to
	 * @throws {Error} If <code>oTarget</code> is not a <code>sap.ui.core.Element</code>
	 * @private
	 */
	DeferredAggregationForwardMixin._registerForwardingTarget = function(oTarget) {
		if (!oTarget?.isA?.("sap.ui.core.Element")) {
			throw new Error("The target must be a sap.ui.core.Element.");
		}

		const oState = this[MIXIN_SYMBOL];
		oState.targetRegistered = true;

		for (const {sAggregationName, fnApplyToTarget} of oState.aggregations) {
			const vStashed = oState[sAggregationName];
			if (vStashed !== undefined && !vStashed?.isDestroyed?.()) {
				fnApplyToTarget.call(this, vStashed);
			}
		}

		const fnOriginalExit = oTarget.exit;

		oTarget.exit = (...args) => {
			const oState = this[MIXIN_SYMBOL];
			oState.targetRegistered = false;

			for (const {sAggregationName, fnApplyToTarget} of oState.aggregations) {
				if (oState[sAggregationName]) {
					fnApplyToTarget.call(this, undefined);
				}
			}

			oTarget.exit = fnOriginalExit;
			fnOriginalExit.apply(oTarget, args);
		};
	};

	/**
	 * Installs the mixin on a control prototype.
	 *
	 * @param {Array<{aggregation: string, applyToTarget: function}>} aSettings One entry per managed aggregation.
	 *   Each entry must carry the <code>aggregation</code> name (must exist in the control's metadata) and an
	 *   <code>applyToTarget</code> callback that receives <code>(vValue)</code> and applies the
	 *   value to the forwarding target.
	 * @throws {Error} If <code>aSettings</code> is not a non-empty array, if an aggregation is unknown, or if
	 *   <code>applyToTarget</code> is not a function.
	 * @private
	 */
	return function(aSettings) {
		if (!Array.isArray(aSettings) || aSettings.length === 0) {
			throw new Error("'aSettings' must be a non-empty array.");
		}

		const aAggregations = [];

		this.init = DeferredAggregationForwardMixin.init(this.init, aAggregations);
		this.exit = DeferredAggregationForwardMixin.exit(this.exit);
		this._registerForwardingTarget = DeferredAggregationForwardMixin._registerForwardingTarget;

		for (const {aggregation: sAggregationName, applyToTarget: fnApplyToTarget} of aSettings) {
			if (!this.getMetadata().hasAggregation(sAggregationName)) {
				throw new Error("Aggregation '" + sAggregationName + "' not found.");
			}
			if (typeof fnApplyToTarget !== "function") {
				throw new Error("'applyToTarget' must be a function.");
			}

			const sCapitalizedName = capitalize(sAggregationName);
			const sSetterName = "set" + sCapitalizedName;
			const sGetterName = "get" + sCapitalizedName;
			const sDestroyerName = "destroy" + sCapitalizedName;

			aAggregations.push({sAggregationName, fnApplyToTarget});

			this[sSetterName] = function(vValue) {
				this[MIXIN_SYMBOL][sAggregationName] = this.validateAggregation(sAggregationName, vValue, false);
				if (this[MIXIN_SYMBOL].targetRegistered) {
					fnApplyToTarget.call(this, vValue);
				}
				return this;
			};

			this[sGetterName] = function() {
				const oValue = this[MIXIN_SYMBOL][sAggregationName];
				return (oValue && !oValue.isDestroyed?.()) ? oValue : null;
			};

			this[sDestroyerName] = function() {
				this[MIXIN_SYMBOL][sAggregationName]?.destroy?.();
				this[MIXIN_SYMBOL][sAggregationName] = null;
				return this;
			};
		}
	};
});
