/*!
 * ${copyright}
 */

// Provides ControllerExtensionMetadata
sap.ui.define(['sap/ui/base/Metadata', 'sap/ui/core/mvc/OverrideExecution'],
	function(Metadata, OverrideExecution) {
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
        Metadata.prototype.applySettings.call(this, oClassInfo);

        var oStaticInfo = oClassInfo.metadata;

        //default call order of lifecycle methods for extensions
        this.mExtensionLifecycleMethods = {
            "onInit": OverrideExecution.After,
            "onExit": OverrideExecution.Before,
            "onBeforeRendering": OverrideExecution.Before,
            "onAfterRendering": OverrideExecution.After
        };

        this._defaultMethodMetadata = {"public": true, "final": false};
        this._mMethods = oStaticInfo.methods || {};

        //check public methods
        this._aPublicMethods = [];
        for ( var n in oClassInfo ) {
            if ( n !== "metadata" && n !== "constructor") {
                if ( !n.match(/^_/) && !(n in this.mExtensionLifecycleMethods)) {
                    this._aPublicMethods.push(n);
                    // default medata for methods
                    if (!(n in this._mMethods)) {
                        this._mMethods[n] = this._defaultMethodMetadata;
                    }
                }
            }
        }
        for ( var m in this._mMethods) {
            this._aPublicMethods.push(m);
        }
        if (oClassInfo['override']) {
            this._override = oClassInfo['override'];
            delete oClassInfo['override'];
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
     * Returns the 'static' override definition registered by the override function for this extension
     *
     * @return {object} oOverrides The overrides
     * @private
     */
    ControllerExtensionMetadata.prototype.getStaticOverrides = function() {
        return this._staticOverride;
    };

     /**
     * Returns the override execution strategy for the given method
     *
     * @param {string} sMethod Name of the method
     * @return {sap.ui.core.mvc.OverrideExecution} sOverrideExecution The override execution strategy
     */
    ControllerExtensionMetadata.prototype.getOverrideExecution = function(sMethod) {
        var oMethodMetadata = this._mAllMethods[sMethod];
        var sOverrideExecution = this.mExtensionLifecycleMethods[sMethod] || OverrideExecution.Instead;
        if (oMethodMetadata) {
            sOverrideExecution = oMethodMetadata.overrideExecution;
        }
        return sOverrideExecution;
    };

    /**
     * Checks wether override definitions exists
     *
     * @return {boolean} bHasOverrides Wether override definitions exists
     * @private
     */
    ControllerExtensionMetadata.prototype.hasOverrides = function() {
        return !!this._override || !!this._staticOverride;
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