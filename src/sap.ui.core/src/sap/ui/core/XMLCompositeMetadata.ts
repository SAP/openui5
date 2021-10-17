import ElementMetadata from "sap/ui/core/ElementMetadata";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import Log from "sap/base/Log";
var mFragmentCache = {};
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
    var bClassIsAbstract = this._bAbstract;
    if (!bClassIsAbstract) {
        if (!oClassInfo.fragment && sClassName !== "sap.ui.core.XMLComposite") {
            oClassInfo.fragment = sClassName;
            oClassInfo.fragmentUnspecified = true;
        }
        if (!this._fragment && oClassInfo.fragment) {
            try {
                if (!this._fragment) {
                    if (oClassInfo.fragmentContent) {
                        if (typeof oClassInfo.fragmentContent === "string") {
                            var oParser = new DOMParser();
                            oClassInfo.fragmentContent = oParser.parseFromString(oClassInfo.fragmentContent, "text/xml").documentElement;
                            if (oClassInfo.fragmentContent && oClassInfo.fragmentContent.getElementsByTagName("parsererror").length) {
                                var sMessage = oClassInfo.fragmentContent.getElementsByTagName("parsererror")[0].innerText;
                                throw new Error("There was an error parsing the XML fragment for XMLComposite '" + sClassName + "'. The following message may contain hints to find the problem: " + sMessage);
                            }
                        }
                        this._fragment = oClassInfo.fragmentContent;
                    }
                    else {
                        this._fragment = this._loadFragment(oClassInfo.fragment, "control");
                    }
                }
            }
            catch (e) {
                if (!oClassInfo.fragmentUnspecified || e.message.startsWith("There was an error parsing")) {
                    throw (e);
                }
                else {
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
XMLCompositeMetadata.extend = function (mSettings) {
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
    var mAggregations = this.getAllAggregations();
    for (var n in mAggregations) {
        if (mAggregations[n].type === "TemplateMetadataContext") {
            this.getAggregation(n)._doesNotRequireFactory = true;
        }
    }
};
XMLCompositeMetadata.prototype._createPrivateAggregationAccessors = function () {
    var mPrivateAggregations = this.getAllPrivateAggregations(), proto = this.getClass().prototype, fnGenHelper = function (name, fn) {
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
        var mAggregations = this.getAllAggregations(), mMandatory = {};
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
        mFragmentCache[sFragmentKey] = XMLTemplateProcessor.loadTemplate(sFragmentName, sExtension);
    }
    return mFragmentCache[sFragmentKey];
};