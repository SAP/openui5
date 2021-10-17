import Element from "./Element";
import assert from "sap/base/assert";
import Log from "sap/base/Log";
var rAnyWhiteSpace = /\s/;
var rNonWhiteSpace = /\S+/g;
var CustomStyleClassSupport = function () {
    if (!(this instanceof Element)) {
        return;
    }
    var fnOriginalClone = this.clone;
    this.clone = function () {
        var oClone = fnOriginalClone.apply(this, arguments);
        if (this.aCustomStyleClasses) {
            oClone.aCustomStyleClasses = this.aCustomStyleClasses.slice();
        }
        if (this.mCustomStyleClassMap) {
            oClone.mCustomStyleClassMap = Object.assign(Object.create(null), this.mCustomStyleClassMap);
        }
        return oClone;
    };
    this.addStyleClass = function (sStyleClass, bSuppressRerendering) {
        assert(typeof sStyleClass === "string", "sStyleClass must be a string");
        if (!sStyleClass || typeof sStyleClass !== "string" || sStyleClass.indexOf("\"") > -1 || sStyleClass.indexOf("'") > -1) {
            return this;
        }
        var aCustomStyleClasses = this.aCustomStyleClasses || (this.aCustomStyleClasses = []), mCustomStyleClassMap = this.mCustomStyleClassMap || (this.mCustomStyleClassMap = Object.create(null)), aClasses, bModified = false, aChangedScopes = [], aScopes = getScopes();
        function check(sClass) {
            if (!mCustomStyleClassMap[sClass]) {
                mCustomStyleClassMap[sClass] = true;
                aCustomStyleClasses.push(sClass);
                if (aScopes && aScopes.indexOf(sClass) > -1) {
                    aChangedScopes.push(sClass);
                }
                bModified = true;
            }
        }
        if (rAnyWhiteSpace.test(sStyleClass)) {
            aClasses = sStyleClass.match(rNonWhiteSpace);
            aClasses && aClasses.forEach(check);
        }
        else {
            check(sStyleClass);
        }
        if (!bModified) {
            return this;
        }
        var oRoot = this.getDomRef();
        if (oRoot) {
            if (aClasses) {
                oRoot.classList.add.apply(oRoot.classList, aClasses);
            }
            else {
                oRoot.classList.add(sStyleClass);
            }
        }
        else if (bSuppressRerendering === false) {
            this.invalidate();
        }
        if (aChangedScopes.length > 0) {
            fireThemeScopingChangedEvent(this, aChangedScopes, true);
        }
        return this;
    };
    this.removeStyleClass = function (sStyleClass, bSuppressRerendering) {
        assert(typeof sStyleClass === "string", "sStyleClass must be a string");
        if (!sStyleClass || typeof sStyleClass !== "string" || !this.aCustomStyleClasses || !this.mCustomStyleClassMap) {
            return this;
        }
        var aCustomStyleClasses = this.aCustomStyleClasses, mCustomStyleClassMap = this.mCustomStyleClassMap, aClasses, bExist = false, aChangedScopes = [], aScopes = getScopes(), nIndex;
        function check(sClass) {
            if (mCustomStyleClassMap[sClass]) {
                bExist = true;
                nIndex = aCustomStyleClasses.indexOf(sClass);
                if (nIndex !== -1) {
                    aCustomStyleClasses.splice(nIndex, 1);
                    delete mCustomStyleClassMap[sClass];
                    if (aScopes && aScopes.indexOf(sClass) > -1) {
                        aChangedScopes.push(sClass);
                    }
                }
            }
        }
        if (rAnyWhiteSpace.test(sStyleClass)) {
            aClasses = sStyleClass.match(rNonWhiteSpace);
            aClasses && aClasses.forEach(check);
        }
        else {
            check(sStyleClass);
        }
        if (bExist) {
            var oRoot = this.getDomRef();
            if (oRoot) {
                if (aClasses) {
                    oRoot.classList.remove.apply(oRoot.classList, aClasses);
                }
                else {
                    oRoot.classList.remove(sStyleClass);
                }
            }
            else if (bSuppressRerendering === false) {
                this.invalidate();
            }
            if (aChangedScopes.length > 0) {
                fireThemeScopingChangedEvent(this, aChangedScopes, false);
            }
        }
        return this;
    };
    this.toggleStyleClass = function (sStyleClass, bAdd) {
        assert(typeof sStyleClass === "string", "sStyleClass must be a string");
        if (sStyleClass && typeof sStyleClass === "string") {
            if (bAdd === true) {
                this.addStyleClass(sStyleClass);
            }
            else if (bAdd === false) {
                this.removeStyleClass(sStyleClass);
            }
            else if (bAdd === undefined) {
                this.hasStyleClass(sStyleClass) ? this.removeStyleClass(sStyleClass) : this.addStyleClass(sStyleClass);
            }
            else {
                Log.warning(this.toString() + "- toggleStyleClass(): bAdd should be a boolean or undefined, but is '" + bAdd + "'");
            }
        }
        return this;
    };
    this.hasStyleClass = function (sStyleClass) {
        assert(typeof sStyleClass === "string", "sStyleClass must be a string");
        if (sStyleClass && typeof sStyleClass === "string" && this.mCustomStyleClassMap) {
            if (rAnyWhiteSpace.test(sStyleClass)) {
                var aClasses = sStyleClass.match(rNonWhiteSpace);
                return aClasses != null && aClasses.every(function (sClass) {
                    return this.mCustomStyleClassMap[sClass];
                }, this);
            }
            else {
                return !!this.mCustomStyleClassMap[sStyleClass];
            }
        }
        return false;
    };
    this.getMetadata().addPublicMethods(["addStyleClass", "removeStyleClass", "toggleStyleClass", "hasStyleClass"]);
};
var Parameters;
function getScopes() {
    if (!Parameters) {
        Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
    }
    if (Parameters) {
        return Parameters._getScopes(true);
    }
}
function fireThemeScopingChangedEvent(oElement, aScopeClasses, bIsAdded) {
    sap.ui.getCore().fireThemeScopingChanged({
        scopes: aScopeClasses,
        added: bIsAdded,
        element: oElement
    });
}