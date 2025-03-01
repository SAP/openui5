/* !
 * ${ copyright }
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/base/ManagedObject",
	"sap/ui/integration/util/LoadingProvider"
], function (
	Element,
	ManagedObject,
	LoadingProvider
) {
	"use strict";

	var DelayedLoadingProvider = LoadingProvider.extend("sap.ui.integration.util.DelayedLoadingProvider", {
		metadata: {
			library: "sap.ui.integration",

			properties: {
				/**
				 * The current loading state.
				 */
				delayed: { type: "boolean", defaultValue: false }
			}
		}
	});

	DelayedLoadingProvider.prototype.destroy = function () {
		if (this._iLoadingDelayHandler) {
			clearTimeout(this._iLoadingDelayHandler);
			this._iLoadingDelayHandler = null;
		}

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	DelayedLoadingProvider.prototype.applyDelay = function (iDelay) {
		if (!iDelay) {
			return;
		}

		this.setDelayed(true);

		this._iLoadingDelayHandler = setTimeout(() => {
			this.setDelayed(false);
		}, iDelay);
	};

	return DelayedLoadingProvider;
});