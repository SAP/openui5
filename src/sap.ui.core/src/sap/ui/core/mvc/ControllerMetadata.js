/*!
 * ${copyright}
 */

// Provides ControllerMetadata
sap.ui.define([
	'sap/ui/base/Metadata',
	'sap/base/util/merge',
	'sap/ui/core/mvc/OverrideExecution',
	"sap/base/Log"
],
	function(Metadata, merge, OverrideExecution, Log) {
	"use strict";

	/**
	 * @alias sap.ui.core.mvc.ControllerMetadata
	 * @extends sap.ui.base.Metadata
	 * @private
	 */
	var ControllerMetadata = function(sClassName, oClassInfo) {
		// call super constructor
		Metadata.apply(this, arguments);

		// propagate static functions to subclasses of ControllerExtension
		if (this.isA("sap.ui.core.mvc.ControllerExtension") && this.getParent().getClass().override ) {
			this.getClass().override = this.getParent().getClass().override;
		}
	};

	// chain the prototypes
	ControllerMetadata.prototype = Object.create(Metadata.prototype);

	ControllerMetadata.prototype.applySettings = function(oClassInfo) {
		// property 'override' needs to be handled separately and must not be attached to the prototype
		if (oClassInfo.override) {
			this._override = oClassInfo.override;
			delete oClassInfo.override;
		}

		Metadata.prototype.applySettings.call(this, oClassInfo);

		var oStaticInfo = oClassInfo.metadata;

		this._defaultLifecycleMethodMetadata = {
			"onInit":               {"public": true, "final": false, "overrideExecution": OverrideExecution.After},
			"onExit":               {"public": true, "final": false, "overrideExecution": OverrideExecution.Before},
			"onBeforeRendering":    {"public": true, "final": false, "overrideExecution": OverrideExecution.Before},
			"onAfterRendering":     {"public": true, "final": false, "overrideExecution": OverrideExecution.After}
		};

		var bIsExtension = this.isA("sap.ui.core.mvc.ControllerExtension");

		var rPrivateCheck = /^_/;

		var bExtendsController = this._oParent.isA("sap.ui.core.mvc.Controller");

		var bDefinesMethods = oClassInfo.metadata && oClassInfo.metadata.methods ? true : false;

		if (!bIsExtension) {
			/*
			* If methods are defined in metadata, only methods prefixed with '_' get private.
			* If not, we stay compatible and every method prefixed with '-' or 'on' gets private.
			*/
			if (bExtendsController && !bDefinesMethods) {
			   rPrivateCheck = /^_|^on|^init$|^exit$/;
			}

			/*
			* extend method metadata: make lifecycle hooks public
			*/
			if (bExtendsController && bDefinesMethods) {
			    merge(oStaticInfo.methods, this._defaultLifecycleMethodMetadata);
			}
		}

		//check public methods
		//in legacy scenarion the public methods defined in metadata must not be deleted
		if (bIsExtension || bDefinesMethods) {
			this._aPublicMethods = [];
		}
		this._mMethods = oStaticInfo.methods || {};
		for ( var n in oClassInfo ) {
			if ( n !== "metadata" && n !== "constructor") {
				if (!n.match(rPrivateCheck)) {
					//final check
					if (bExtendsController && this._oParent && this._oParent.isMethodFinal(n)) {
						Log.error("Method: '" + n + "' of controller '" + this._oParent.getName() + "' is final and cannot be overridden by controller '" + this.getName() + "'");
						delete this._oClass.prototype[n];
					}
					// default metadata for methods
					if (!(n in this._mMethods) && typeof oClassInfo[n] === 'function') {
						// do not provide metadata for extension members
						if (!(oClassInfo[n].getMetadata && oClassInfo[n].getMetadata().isA("sap.ui.core.mvc.ControllerExtension"))) {
							this._mMethods[n] = {"public": true, "final": false};
						}
					}
				}
			}
		}
		for (var m in this._mMethods) {
			if (this.isMethodPublic(m)) {
			    this._aPublicMethods.push(m);
			}
		}
	};

	/**
	 * Called after new settings have been applied.
	 *
	 * Typically, this method is used to do some cleanup (e.g. uniqueness)
	 * or to calculate an optimized version of some data.
	 * @private
	 * @since 1.3.1
	 */
	ControllerMetadata.prototype.afterApplySettings = function() {
		Metadata.prototype.afterApplySettings.call(this);
		var bIsExtension = this.isA("sap.ui.core.mvc.ControllerExtension");
		if (this._oParent) {
			var mParentMethods = this._oParent._mMethods ? this._oParent._mMethods : {};
			//allow change of visibility but not the other attributes
			for (var sMethod in mParentMethods) {
			if (this._mMethods[sMethod] && !bIsExtension) {
			var bPublic = this._mMethods[sMethod].public;
			//copy parent method definition as final/overrideExecution should not be overridden
			this._mMethods[sMethod] = merge({}, mParentMethods[sMethod]);
			if (bPublic !== undefined) {
			this._mMethods[sMethod].public = bPublic;
			}
			if (!this.isMethodPublic(sMethod) && this._mMethods[sMethod].public !== mParentMethods[sMethod].public) {
			//if visibility changed to private delete from public methods
			this._aAllPublicMethods.splice(this._aAllPublicMethods.indexOf(sMethod), 1);
			}
			} else {
			this._mMethods[sMethod] = mParentMethods[sMethod];
			}
			}
		}

		//flag each extension as final (but not the class ControllerExtension itself)
		if (this._oParent && this._oParent.isA("sap.ui.core.mvc.ControllerExtension")) {
		   this._bFinal = true;
		}
	};

	/**
	 * Returns the Namespace for a ControllerExtension. The Namespace is
	 * extracted from the ControllerExtensions name:
	 * <pre>
	 *   name: my.name.space.Extension
	 *   namespace = my.name.space
	 * </pre>
	 * @return {string} The Namespace
	 * @public
	 */
	ControllerMetadata.prototype.getNamespace = function() {
		var bIsAnonymous = this._sClassName.indexOf("anonymousExtension~") == 0;
		var sNamespace = bIsAnonymous ? this._oParent._sClassName : this._sClassName;
		return sNamespace.substr(0,sNamespace.lastIndexOf("."));
	};

	/**
	 * Check if method is flagged as final.
	 *
	 * @param {string} sMethod Name of the method
	 * @return {boolean} Whether the method is flagged as final or not
	 */
	ControllerMetadata.prototype.isMethodFinal = function(sMethod) {
		var oMethodMetadata = this._mMethods[sMethod];
		return oMethodMetadata && oMethodMetadata.final;
	};

	/**
	 * Check if method is flagged as public.
	 *
	 * @param {string} sMethod Name of the method
	 * @return {boolean} Whether the method is flagged as public or not
	 */
	ControllerMetadata.prototype.isMethodPublic = function(sMethod) {
		var oMethodMetadata = this._mMethods[sMethod];
		return oMethodMetadata && oMethodMetadata.public;
	};

	/**
	 * Get all defined methods and their metadata.
	 *
	 * @return {Object<string,object>} A map containing all methods (key) and their metadata
	 */
	ControllerMetadata.prototype.getAllMethods = function() {
		return this._mMethods;
	};

	/**
	 * Returns the override execution strategy for the given method.
	 *
	 * @param {string} sMethod Name of the method
	 * @return {sap.ui.core.mvc.OverrideExecution} The override execution strategy
	 */
	ControllerMetadata.prototype.getOverrideExecution = function(sMethod) {
		var oMethodMetadata = this._mMethods[sMethod];
		var sOverrideExecution = OverrideExecution.Instead;
		if (oMethodMetadata) {
			sOverrideExecution = oMethodMetadata.overrideExecution;
		}
		return sOverrideExecution;
	};

	 /**
	 * Returns the override definition of this extension.
	 *
	 * @return {object} The overrides
	 * @private
	 */
	ControllerMetadata.prototype.getOverrides = function() {
		return this._override;
	};

	 /**
	 * Returns the 'static' override definition registered by the override function for this extension
	 *
	 * @return {object} The static overrides
	 * @private
	 */
	ControllerMetadata.prototype.getStaticOverrides = function() {
		return this._staticOverride;
	};

	/**
	 * Checks whether override definitions exists.
	 *
	 * @return {boolean} Whether override definitions exists
	 * @private
	 */
	ControllerMetadata.prototype.hasOverrides = function() {
		return !!this._override || !!this._staticOverride;
	};

	/**
	 * Get configuration for extending lifecycle methods.
	 *
	 * @return {Object<string,object>} A map containing the lifecycle configuration metadata
	 * @private
	 */
	ControllerMetadata.prototype.getLifecycleConfiguration = function() {
		return this._defaultLifecycleMethodMetadata;
	};

	return ControllerMetadata;
});