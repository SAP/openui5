import jQuery from "sap/ui/thirdparty/jquery";
function addToAttributeList(sAttribute, sValue, bPrepend) {
    var sAttributes = this.attr(sAttribute);
    if (!sAttributes) {
        return this.attr(sAttribute, sValue);
    }
    var aAttributes = sAttributes.split(" ");
    if (aAttributes.indexOf(sValue) == -1) {
        bPrepend ? aAttributes.unshift(sValue) : aAttributes.push(sValue);
        this.attr(sAttribute, aAttributes.join(" "));
    }
    return this;
}
function removeFromAttributeList(sAttribute, sValue) {
    var sAttributes = this.attr(sAttribute) || "", aAttributes = sAttributes.split(" "), iIndex = aAttributes.indexOf(sValue);
    if (iIndex == -1) {
        return this;
    }
    aAttributes.splice(iIndex, 1);
    if (aAttributes.length) {
        this.attr(sAttribute, aAttributes.join(" "));
    }
    else {
        this.removeAttr(sAttribute);
    }
    return this;
}
jQuery.fn.addAriaLabelledBy = function (sId, bPrepend) {
    return addToAttributeList.call(this, "aria-labelledby", sId, bPrepend);
};
jQuery.fn.removeAriaLabelledBy = function (sId) {
    return removeFromAttributeList.call(this, "aria-labelledby", sId);
};
jQuery.fn.addAriaDescribedBy = function (sId, bPrepend) {
    return addToAttributeList.call(this, "aria-describedby", sId, bPrepend);
};
jQuery.fn.removeAriaDescribedBy = function (sId) {
    return removeFromAttributeList.call(this, "aria-describedby", sId);
};