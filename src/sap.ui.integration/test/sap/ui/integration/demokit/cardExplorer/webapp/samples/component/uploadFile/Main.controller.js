sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/integration/library"
], (
	Controller,
	JSONModel,
	library
) => {
	"use strict";

	const CardMessageType = library.CardMessageType;

	return Controller.extend("my.component.sample.uploadFile.Main", {
		onInit() {
			this.oModel = new JSONModel({
				fileSelected: false
			});
			this.getView().setModel(this.oModel);
		},
		onFileChange(e) {
			const aFiles = e.getParameter("files");

			this.oModel.setProperty("/fileSelected", aFiles.length > 0);

			if (aFiles.length > 0) {
				this._file = aFiles[0];
			} else {
				this._file = null;
			}
		},
		async onSubmit() {
			const oData = new FormData();
			const oCard = this.getOwnerComponent().card;

			oData.append("sender", "John Doe");
			oData.append("avatar", this._file);

			try {
				await oCard.request({
					url: "/user/avatar",
					method: "POST",
					parameters: oData
				});
				oCard.showMessage("Avatar uploaded successfully", CardMessageType.Success);
			} catch {
				oCard.showMessage("Avatar upload failed", CardMessageType.Error);
			}
		}
	});
});