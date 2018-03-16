sap.ui.jsview("testdata.mvc.Async", { // this View file is called Async.view.js

	getControllerName: function() {
		return "testdata.mvc.Async"; // the Controller lives in testdata.mvc.Async.controller.js
	},

	createContent: function(oController) {
		var oImg = new sap.ui.commons.Image({
			width: '115px',
			height: '110px',
			src: './testdata/images/screw.jpg'
		});
		var oMtrx = new sap.ui.commons.layout.MatrixLayout({
			id: this.createId("Layout"),
            width: "250px"
		});

		var oMLR = new sap.ui.commons.layout.MatrixLayoutRow();
		var oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.Label({
				text: "Product"
			})
		});
		oMLR.addCell(oMLC);
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.TextField({
				id: this.createId("Product"),
				value: "Deluxe Screw"
			})
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		oMLR = new sap.ui.commons.layout.MatrixLayoutRow();
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.Label({
				text: "Material"
			})
		});
		oMLR.addCell(oMLC);
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.TextField({
				id: this.createId("Material"),
				value: "Titanium"
			})
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		oMLR = new sap.ui.commons.layout.MatrixLayoutRow({
			visible: false
		});
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.Label({
				id: this.createId("More1"),
				text: "Diameter:"
			})
		});
		oMLR.addCell(oMLC);
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.TextField({
				id: this.createId("TFMore1"),
				value: "1/4 inch"
			})
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		oMLR = new sap.ui.commons.layout.MatrixLayoutRow({
			visible: false
		});
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.Label({
				id: this.createId("More2"),
				text: "Length:"
			})
		});
		oMLR.addCell(oMLC);
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.TextField({
				id: this.createId("TFMore2"),
				value: "2 inch"
			})
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		oMLR = new sap.ui.commons.layout.MatrixLayoutRow({
			visible: false
		});
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.Label({
				id: this.createId("More3"),
				text: "Package Quantity:"
			})
		});
		oMLR.addCell(oMLC);
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: new sap.ui.commons.TextField({
				id: this.createId("TFMore3"),
				value: "500"
			})
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		oMLR = new sap.ui.commons.layout.MatrixLayoutRow();
		oMLC = new sap.ui.commons.layout.MatrixLayoutCell({
			content: [new sap.ui.commons.Link({
				id: this.createId("showMore"),
				text: "show details...",
				press: "showDetails"
			}), new sap.ui.commons.Link({
				id: this.createId("hideMore"),
				text: "hide details...",
				press: "hideDetails"
			})]
		});
		oMLR.addCell(oMLC);
		oMtrx.addRow(oMLR);

		return [oImg, oMtrx];
	}

});
