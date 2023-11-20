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
	'sap/ui/core/ElementMetadata',
	'sap/ui/core/XMLTemplateProcessor',
	"sap/base/Log"
], function(ElementMetadata, XMLTemplateProcessor, Log) {
	"use strict";

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
	 * @extends sap.ui.core.ElementMetadata
	 * @public
	 * @experimental
	 */
	var XMLCompositeMetadata = function (sClassName, oClassInfo) {
		this.InvalidationMode = {
				Render: true,
				None: false
			};

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
						if (oClassInfo.fragmentContent) { // content provided directly, do NOT load XML from file
							if (typeof oClassInfo.fragmentContent === "string") { // parse if not already an XML document
								var oParser = new DOMParser();
								oClassInfo.fragmentContent = oParser.parseFromString(oClassInfo.fragmentContent, "text/xml").documentElement;

								// DOMParser throws an exception in IE11, FF only logs an error, Chrome does nothing; there is a <parsererror> tag in the result, though; only handle Chrome for now
								if (oClassInfo.fragmentContent && oClassInfo.fragmentContent.getElementsByTagName("parsererror").length) { // parser error
									var sMessage = oClassInfo.fragmentContent.getElementsByTagName("parsererror")[0].innerText; // contains "Below is a rendering of the page up to the first error", but don't bother removing it
									throw new Error("There was an error parsing the XML fragment for XMLComposite '" + sClassName + "'. The following message may contain hints to find the problem: " + sMessage);
								}
							}
							this._fragment = oClassInfo.fragmentContent; // otherwise assume XML
						} else {
							this._fragment = this._loadFragment(oClassInfo.fragment, "control");
						}
					}
				} catch (e) {
					if (!oClassInfo.fragmentUnspecified /* fragment xml was explicitly specified so we expect to find something */ || e.message.startsWith("There was an error parsing")) {
						throw (e);
					} else {
						// should the class perhaps have been abstract ...
						Log.warning("Implicitly inferred fragment xml " + oClassInfo.fragment + " not found. " + sClassName + " is not abstract!");
					}
				}
			}
		}

		this._sCompositeAggregation = oClassInfo.metadata ? oClassInfo.metadata.compositeAggregation || null : null;

		this._createPrivateAggregationAccessors();
		this._applyAggregationSettings();
	};

	XMLCompositeMetadata.prototype = Object.create(ElementMetadata.prototype);
	XMLCompositeMetadata.prototype.constructor = XMLCompositeMetadata;
	XMLCompositeMetadata.uid = ElementMetadata.uid;

	XMLCompositeMetadata.extend = function(mSettings) {
		for (var key in mSettings) {
			XMLCompositeMetadata[key] = mSettings[key];
		}
		return XMLCompositeMetadata;
	};

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
			oMember.appData.invalidate = this.InvalidationMode.None;
		}
		if (oMember && oMember.appData && oMember.appData.invalidate === this.InvalidationMode.Render) {
			return false;
		}
		return true;
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

	XMLCompositeMetadata.prototype._loadFragment = function (sFragmentName, sExtension) {
		var sFragmentKey = sExtension + "$" + sFragmentName;
		if (!mFragmentCache[sFragmentKey]) {
			mFragmentCache[sFragmentKey] = XMLTemplateProcessor.loadTemplate(sFragmentName, sExtension); // legacy-relevant: sync loading of XML resource
		}

		return mFragmentCache[sFragmentKey];
	};

	return XMLCompositeMetadata;

}, true);