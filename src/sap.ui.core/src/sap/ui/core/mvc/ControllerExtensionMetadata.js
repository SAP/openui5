/*!
 * ${copyright}
 */

// Provides ControllerExtensionMetadata
sap.ui.define(['sap/ui/base/Metadata'],
	function(Metadata) {
	"use strict";

    var ControllerExtensionMetadata = function(sClassName, oClassInfo) {
        // call super constructor
        Metadata.apply(this, arguments);
        //handle static functions
        this.getClass().override = this.getParent().getClass().override;
    };

    // chain the prototypes
    ControllerExtensionMetadata.prototype = Object.create(Metadata.prototype);

    ControllerExtensionMetadata.prototype.applySettings = function(oClassInfo) {
        var oStaticInfo = oClassInfo.metadata;

        // define call order of lifecycle methods for extensions
        // "true" means original before, "false" means original afterwards
        this.mExtensionLifecycleMethods = {
            "onInit": true,
            "onExit": false,
            "onBeforeRendering": false,
            "onAfterRendering": true
        };

        this._defaultMethodMetadata = {"public": true, "final": false};
        this._mMethods = oStaticInfo.methods || {};

        //check public methods
        this._aPublicMethods = [];
        for ( var n in oClassInfo ) {
            if ( n !== "metadata" && n !== "constructor") {
                if ( !n.match(/^_/)) {
                    this._aPublicMethods.push(n);
                    // default medata for methods
                    if (!(n in this._mMethods)) {
                        this._mMethods[n] = this._defaultMethodMetadata;
                    }
                }
            }
        }
        if (oClassInfo['override']) {
            this._override = oClassInfo['override'];
            delete oClassInfo['override'];
        }
        Metadata.prototype.applySettings.call(this, oClassInfo);
    };

	/**
	 * Called after new settings have been applied.
	 *
	 * Typically, this method is used to do some cleanup (e.g. uniqueness)
	 * or to calculate an optimized version of some data.
	 * @private
	 * @since 1.3.1
	 */
	ControllerExtensionMetadata.prototype.afterApplySettings = function() {
		Metadata.prototype.afterApplySettings.call(this);
        if ( this._oParent) {
            this._mAllMethods = this._oParent._mMethods ? jQuery.extend(this._mMethods, this._oParent._mMethods) : this._mMethods;
        }

        //flag each extension as final
        var oParentClass = this._oParent && this._oParent.getClass();
        if (oParentClass && oParentClass.getMetadata().getName() === "sap.ui.core.mvc.ControllerExtension") {
            this._bFinal = true;
        }
    };

    /**
     * Returns the Namespace for a ControllerExtension. The Namespace is
     * extracted from the ControllerExtensions name:
     * name: my.name.space.Extension
     * namespace = my.name.space
     *
     * @return {string} sNamespace The Namespace
     * @public
     */
    ControllerExtensionMetadata.prototype.getNamespace = function() {
        var sNamespace = this._sClassName;
        return sNamespace.substr(0,sNamespace.lastIndexOf("."));
    };

    /**
     * Check if method is flagged as final
     *
     * @param {string} sMethod Name of the method
     * @return {boolena} bFinal Wether the method is flagged as final or not
     */
    ControllerExtensionMetadata.prototype.isMethodFinal = function(sMethod) {
        var oMethodMetadata = this._mAllMethods[sMethod];
        return oMethodMetadata && oMethodMetadata.final;
    };

    /**
     * Check if method is flagged as public
     *
     * @param {string} sMethod Name of the method
     * @return {boolena} bPublic Wether the method is flagged as public or not
     */
    ControllerExtensionMetadata.prototype.isMethodPublic = function(sMethod) {
        var oMethodMetadata = this._mAllMethods[sMethod];
        return oMethodMetadata && oMethodMetadata.public;
    };

    /**
     * get all defined methods and their metadata
     * @return {map} mMethods a map containig all methods (key) and their metadata
     */
    ControllerExtensionMetadata.prototype.getAllMethods = function() {
        return this._mAllMethods;
    };

    /**
     * Returns the override definition of this extension
     *
     * @return {object} oOverrides The overrides
     * @private
     */
    ControllerExtensionMetadata.prototype.getOverrides = function() {
        return this._override;
    };

    /**
     * Checks wether override definitions exists
     *
     * @return {boolean} bHasOverrides Wether override definitions exists
     * @private
     */
    ControllerExtensionMetadata.prototype.hasOverrides = function() {
        return !!this._override;
    };

    /**
     * Get configuration for extending lifecycle methods
     *
     * @return {map} bHasOverrides Wether override definitions exists
     * @private
     */
    ControllerExtensionMetadata.prototype.getLifecycleConfiguration = function() {
        return this.mExtensionLifecycleMethods;
    };

    return ControllerExtensionMetadata;
});