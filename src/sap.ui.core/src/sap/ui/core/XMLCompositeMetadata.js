/*!
 * ${copyright}
 */

/**
 * This class is used in connection with XMLComposite
 *
 * CAUTION: naming, location and APIs of this entity will possibly change and should
 * therefore be considered experimental
 *
 * @private
 *
 */
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/ElementMetadata', 'sap/ui/core/XMLTemplateProcessor'
], function (jQuery, ElementMetadata, XMLTemplateProcessor) {
	"use strict";

	var InvalidationMode = {
		Render: true,
		Template: "template",
		None: false
	};

	var mFragmentCache = {};

	/*
	 *
	 * Creates a new metadata object that describes a subclass of XMLComposite.
	 *
	 * @param {string} sClassName fully qualified name of the described class
	 * @param {object} oClassInfo static info to construct the metadata from
	 *
	 * @author SAP SE
	 * @version ${version}
	 * @since 1.50.0
	 * @alias sap.ui.core.XMLCompositeMetadata
	 *
	 * @public
	 * @experimental
	 */
	var XMLCompositeMetadata = function (sClassName, oClassInfo) {
		if (!oClassInfo.hasOwnProperty("renderer")) {
			oClassInfo.renderer = "sap.ui.core.XMLCompositeRenderer";
		}

		if (!oClassInfo.hasOwnProperty("alias")) {
			oClassInfo.alias = "this";
		}

		ElementMetadata.apply(this, arguments);
		var bClassIsAbstract = this._bAbstract;// notice we cannot use this.getMetadata().isAbstract() yet ...
		if (!bClassIsAbstract) {
			// class is not abstract so we try to load accompanying xml
			if (!oClassInfo.fragment && sClassName !== "sap.ui.core.XMLComposite") {
				oClassInfo.fragment = sClassName;
				oClassInfo.fragmentUnspecified = true;
			}
			if (!this._fragment && oClassInfo.fragment) {
				try {
					if (!this._fragment) {
						this._fragment = this._loadFragment(oClassInfo.fragment, "control");
					}
					if (oClassInfo.aggregationFragments) {
						this._aggregationFragments = {};
						oClassInfo.aggregationFragments.forEach(function(sAggregationFragment) {
							this._aggregationFragments[sAggregationFragment] = this._loadFragment(oClassInfo.fragment + "_" + sAggregationFragment, "aggregation");
						}.bind(this));
					}
				} catch (e) {
					if (!oClassInfo.fragmentUnspecified) {
						// fragment xml was explicitly specified so we expect to find something !
						throw (e);
					} else {
						// should the class perhaps have been abstract ...
						jQuery.sap.log.warning("Implicitly inferred fragment xml " + oClassInfo.fragment + " not found. " + sClassName + " is not abstract!");
					}
				}
			}
		}

		this._sCompositeAggregation = oClassInfo.metadata ? oClassInfo.metadata.compositeAggregation || null : null;

		this._createPrivateAggregationAccessors();
		this._applyAggregationSettings();
	};

	XMLCompositeMetadata.prototype = Object.create(ElementMetadata.prototype);
	XMLCompositeMetadata.uid = ElementMetadata.uid;

	XMLCompositeMetadata.prototype.getCompositeAggregationName = function () {
		return this._sCompositeAggregation || "_content";
	};

	XMLCompositeMetadata.prototype.getFragment = function () {
		if (this._fragment) {
			return this._fragment.cloneNode(true);
		}
	};

	XMLCompositeMetadata.prototype._applyAggregationSettings = function () {
		// TBD: Is this till needed?
		var mAggregations = this.getAllAggregations();
		for (var n in mAggregations) {
			if (mAggregations[n].type === "TemplateMetadataContext") {
				this.getAggregation(n)._doesNotRequireFactory = true;
			}
		}
	};

	XMLCompositeMetadata.prototype._createPrivateAggregationAccessors = function () {
		var mPrivateAggregations = this.getAllPrivateAggregations(),
			proto = this.getClass().prototype,
			fnGenHelper = function (name, fn) {
				if (!proto[name]) {
					proto[name] = fn;
				}
			};
		for (var n in mPrivateAggregations) {
			mPrivateAggregations[n].generate(fnGenHelper);
		}
	};

	XMLCompositeMetadata.prototype._suppressInvalidate = function (oMember, bSuppress) {
		if (bSuppress) {
			return true;
		}
		if (!oMember.appData) {
			oMember.appData = {};
			oMember.appData.invalidate = InvalidationMode.None;
		}
		if (oMember && oMember.appData && oMember.appData.invalidate === InvalidationMode.Render) {
			return false;
		}
		return true; // i.e. invalidate = InvalidationMode.None || InvalidationMode.Template
	};

	XMLCompositeMetadata.prototype._requestFragmentRetemplatingCheck = function (oControl, oMember, bForce) {
		if (!oControl._bIsBeingDestroyed && oMember && oMember.appData && oMember.appData.invalidate === InvalidationMode.Template &&
			!oControl._requestFragmentRetemplatingPending) {
			if (oControl.requestFragmentRetemplating) {
				oControl._requestFragmentRetemplatingPending = true;
				// to avoid several separate re-templating requests we collect them
				// in a timeout
				setTimeout(function () {
					oControl.requestFragmentRetemplating(bForce);
					oControl._requestFragmentRetemplatingPending = false;
				}, 0);
			} else {
				throw new Error("Function requestFragmentRetemplating not available although invalidationMode was set to template");
			}
		}
	};

	XMLCompositeMetadata.prototype.getMandatoryAggregations = function () {
		if (!this._mMandatoryAggregations) {
			var mAggregations = this.getAllAggregations(),
				mMandatory = {};
			for (var n in mAggregations) {
				if (mAggregations[n].type === "TemplateMetadataContext" && mAggregations[n].appData.mandatory) {
					mMandatory[n] = mAggregations[n];
				}
			}
			this._mMandatoryAggregations = mMandatory;
		}
		return this._mMandatoryAggregations;
	};

	XMLCompositeMetadata.prototype.requireFor = function (oElement) {
		var sModuleNames = oElement.getAttribute("template:require");
		if (sModuleNames) {
			jQuery.sap.require.apply(jQuery.sap, sModuleNames.split(" "));
		}
	};

	XMLCompositeMetadata.prototype._loadFragment = function (sFragmentName, sExtension) {
		if (!mFragmentCache[sFragmentName]) {
			mFragmentCache[sFragmentName] = XMLTemplateProcessor.loadTemplate(sFragmentName, sExtension);
			this.requireFor(mFragmentCache[sFragmentName]);
		}

		return mFragmentCache[sFragmentName];
	};

	XMLCompositeMetadata.prototype.hasAggregation = function(sName) {
		//needed for copy
		return !!this._mAllAggregations[sName] || !!this._mAllPrivateAggregations[sName];
	};

	return XMLCompositeMetadata;

}, true);
