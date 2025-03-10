function main() {
	sap.ui.require(["sap/ui/core/mvc/XMLView"], async (XMLView) => {
		const oView = await XMLView.create({
			viewName:"mvctest.views.ExtendedXMLViewEventHandlerSyntax"
		});
		oView.placeAt("content");
	});
}