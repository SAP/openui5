import UIComponent from "sap/ui/core/UIComponent";
var mEntityContexts = {}, Routing;
Routing = {
    getAndRemoveEntityContext: function (sTarget) {
        var oContext = mEntityContexts[sTarget];
        delete mEntityContexts[sTarget];
        return oContext;
    },
    navigateTo: function (oController, sTarget, mParameters, bReplace, oEntityContext) {
        mEntityContexts[sTarget] = oEntityContext;
        UIComponent.getRouterFor(oController).navTo(sTarget, mParameters, bReplace);
    },
    navigateToArtist: function (oController, oArtistContext, bReplace) {
        Routing.navigateTo(oController, "objectPage", { artistPath: oArtistContext.getPath().slice(1) }, bReplace, oArtistContext);
    }
};