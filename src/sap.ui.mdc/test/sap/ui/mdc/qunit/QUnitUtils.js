/*
 * ! ${copyright}
 */

/**
 * Utilities for QUnit tests in MDC
 *
 * @private
 */
sap.ui.define(function() {
	"use strict";

	function stubPropertyInfos(oTarget, aPropertyInfos) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchProperties;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyInfos) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			try {
				oTarget.getPropertyHelper();
				bPropertyHelperExists = true;
			} catch (e) {
				bPropertyHelperExists = false;
			}

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchProperties = oDelegate.fetchProperties;

			oDelegate.fetchProperties = function() {
				fnOriginalFetchProperties.apply(this, arguments);
				return Promise.resolve(aPropertyInfos);
			};
			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyInfos = function() {
			delete oTarget.__restorePropertyInfos;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchProperties = fnOriginalFetchProperties;
			}
		};
	}

	function stubPropertyInfosForBinding(oTarget, aPropertyInfos) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchPropertiesForBinding;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyInfosForBinding) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			try {
				oTarget.getPropertyHelper();
				bPropertyHelperExists = true;
			} catch (e) {
				bPropertyHelperExists = false;
			}

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchPropertiesForBinding = oDelegate.fetchPropertiesForBinding;

			oDelegate.fetchPropertiesForBinding = function() {
				fnOriginalFetchPropertiesForBinding.apply(this, arguments);
				return Promise.resolve(aPropertyInfos);
			};
			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyInfosForBinding = function() {
			delete oTarget.__restorePropertyInfosForBinding;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchPropertiesForBinding = fnOriginalFetchPropertiesForBinding;
			}
		};
	}

	function stubPropertyExtension(oTarget, mExtensions) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchPropertyExtensions;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyExtension) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			try {
				oTarget.getPropertyHelper();
				bPropertyHelperExists = true;
			} catch (e) {
				bPropertyHelperExists = false;
			}

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchPropertyExtensions = oDelegate.fetchPropertyExtensions;

			oDelegate.fetchPropertyExtensions = function() {
				fnOriginalFetchPropertyExtensions.apply(this, arguments);
				return Promise.resolve(mExtensions);
			};
			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyExtension = function() {
			delete oTarget.__restorePropertyExtension;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchPropertyExtensions = fnOriginalFetchPropertyExtensions;
			}
		};
	}

	function stubPropertyExtensionsForBinding(oTarget, mExtensions) {
		var fnOriginalGetControlDelegate = oTarget.getControlDelegate;
		var fnOriginalAwaitControlDelegate = oTarget.awaitControlDelegate;
		var oDelegate;
		var fnOriginalFetchPropertyExtensionsForBinding;
		var bPropertyHelperExists;

		if (typeof fnOriginalGetControlDelegate !== "function") {
			throw new Error("The target cannot be stubbed. " + oTarget);
		}

		if (oTarget.__restorePropertyExtensionsForBinding) {
			throw new Error("The target is already stubbed. " + oTarget);
		}

		if (typeof oTarget.getPropertyHelper === "function") {
			try {
				oTarget.getPropertyHelper();
				bPropertyHelperExists = true;
			} catch (e) {
				bPropertyHelperExists = false;
			}

			if (bPropertyHelperExists) {
				throw new Error("The target cannot be stubbed if the property helper is already initialized. " + oTarget);
			}
		}

		function getDelegate() {
			if (oDelegate) {
				return oDelegate;
			}

			oDelegate = fnOriginalGetControlDelegate.apply(this, arguments);
			fnOriginalFetchPropertyExtensionsForBinding = oDelegate.fetchPropertyExtensionsForBinding;

			oDelegate.fetchPropertyExtensionsForBinding = function() {
				fnOriginalFetchPropertyExtensionsForBinding.apply(this, arguments);
				return Promise.resolve(mExtensions);
			};
			return oDelegate;
		}

		oTarget.getControlDelegate = function() {
			return getDelegate.call(this);
		};

		oTarget.awaitControlDelegate = function() {
			return fnOriginalAwaitControlDelegate.apply(this, arguments).then(function() {
				return getDelegate.call(this);
			}.bind(this));
		};

		oTarget.__restorePropertyExtensionsForBinding = function() {
			delete oTarget.__restorePropertyExtension;
			oTarget.getControlDelegate = fnOriginalGetControlDelegate;
			oTarget.awaitControlDelegate = fnOriginalAwaitControlDelegate;

			if (oDelegate) {
				oDelegate.fetchPropertyExtensionsForBinding = fnOriginalFetchPropertyExtensionsForBinding;
			}
		};
	}

	function restorePropertyInfos(oTarget) {
		if (oTarget.__restorePropertyInfos) {
			oTarget.__restorePropertyInfos();
		}
	}

	function restorePropertyInfosForBinding(oTarget) {
		if (oTarget.__restorePropertyInfosForBinding) {
			oTarget.__restorePropertyInfosForBinding();
		}
	}

	function restorePropertyExtension(oTarget) {
		if (oTarget.__restorePropertyExtension) {
			oTarget.__restorePropertyExtension();
		}
	}

	function restorePropertyExtensionsForBinding(oTarget) {
		if (oTarget.__restorePropertyExtensionsForBinding) {
			oTarget.__restorePropertyExtensionsForBinding();
		}
	}

	return {
		stubPropertyInfos: stubPropertyInfos,
		restorePropertyInfos: restorePropertyInfos,
		stubPropertyExtension: stubPropertyExtension,
		restorePropertyExtension: restorePropertyExtension,
		stubPropertyInfosForBinding: stubPropertyInfosForBinding,
		restorePropertyInfosForBinding: restorePropertyInfosForBinding,
		stubPropertyExtensionsForBinding: stubPropertyExtensionsForBinding,
		restorePropertyExtensionsForBinding: restorePropertyExtensionsForBinding
	};
});