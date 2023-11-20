/*!
 * ${copyright}
 */
sap.ui.define([
    "sap/ui/mdc/LinkDelegate",
    "sap/ui/mdc/link/LinkItem"
], function(LinkDelegate, LinkItem) {
    "use strict";

    var SampleLinkDelegate = Object.assign({}, LinkDelegate);

    SampleLinkDelegate.fetchLinkItems = function() {
        var aLinkItems = [
            new LinkItem({
                key: "link_book",
                text: "Manage book",
                href: self.location.pathname + (self.location.search && self.location.search) + "#/Books/{path: 'ID', targetType: 'raw'}",
                target: "_blank",
				initiallyVisible: true
            }),
            new LinkItem({
                key: "link_author",
                text: "Manage author",
                href: self.location.pathname + (self.location.search && self.location.search) + "#/Authors/{path: 'author_ID', targetType: 'raw'}",
                target: "_blank"
            })
        ];
        return Promise.resolve(aLinkItems);
    };

    return SampleLinkDelegate;
});
