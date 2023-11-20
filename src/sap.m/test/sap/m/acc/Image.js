sap.ui.define([
	"sap/base/Log",
	"sap/m/Image",
	"sap/m/library"
], function(Log, MImage, mobileLibrary) {
	"use strict";

	// shortcut for sap.m.ImageMode
	var ImageMode = mobileLibrary.ImageMode;

	var oImage = new MImage({
		id: "image_not_decorative",
		src: "../images/SAPLogo.jpg",
		alt: "test image",
		decorative: false
	});

	var oImageWithoutDensityAware = new MImage({
		src: "../images/SAPLogo.jpg",
		alt: "test image",
		decorative: false,
		width: "150px",
		height: "74px",
		densityAware: false
	});

	var sSrc3 = "../images/SAPUI5.png",
		i3 = new MImage("i3", {
			src: sSrc3,
			alt: "test image",
			decorative: false
		});

	var oImage1 = new MImage({
		src: "../images/SAPUI5.png",
		alt: "test image",
		decorative: false,
		press: function(){
			Log.info("!!!oImage1 pressed!!!");
		}
	});
	oImage1.addStyleClass("img1");

	var oImageButton = new MImage({
		id: "image_button",
		src: "../images/action.png",
		activeSrc: "../images/action_pressed.png",
		alt: "test image",
		decorative: false,
		ariaDetails: "det",
		press: function(){
			Log.info("!!!oImageButton pressed!!!");
		}
	});

	var oDataImage = new MImage({
		src: "data:image/gif;base64,R0lGODlhHwAeANU/AO1SReW2N+14Kf3YACOAulrAWtTW02Gh1uPIx/BkVFXKXu3t7bjZuoi9R7nV8fbOG8fBulSlWvh8ZlW0WvTu0aG8QqK92sGkdcWjoPr5+WyrUUaiV7q0oHWs2vrTCYOeiJ94QulCOYK34ceNifHEJfLWRuLf3tomHUWUzeQxLf/cDc1+dtzCOqKzo83o92mxbPSSjP/ohspCL2K1WG7Ga+k5NIGfWcbKKcu5ceTPBvDKAJfRkIyvjVvEXeV4af///yH5BAEAAD8ALAAAAAAfAB4AAAb/wJ9wSPwtDBCMEmJYFJ/QXwYx8kmuWIlvBMlEoaZVIptNmBMrw5eIObvfZkACgFn/MIA8/J3vj74jfYJycYMAIYh/TxCIiIaGjYg1NRBFCzYhNZGbk42TNSmhmiZELQogKZ+SNQkwrhICsbKzF0MLLwozMqmTKQAICy7CCxQlOg8PHh4DAyoPTj8QPQWnoikJCw4i29sOGSXKzOIqlT88CgXTuykhJg4HHdwdBxYUKuLjOFIv09Q2JydguIDXoaDBAw5i4GOmgkWGW/2ogTiBQASKAxgzHkAhgsLCZs8WzIjYQ4MMBBs1Zrxo7+MDEyILyJR5CiWKmzhxHmi58OWtzJkye8xA0IFATpwEOnj8SGJBhhdAZ+5wQMBozqoJPw5waC5qUANFq4pNylOcBxX6ok3wWoCGAQtjCVgwUWKhsgflfrKlweCtBQsGGFT46OFBAGg/WkxYu3eH4xcRcuC7+4ADkQURFrOduXiw2cKGEQuBkJkx2wkzlg1QVpgEiXJFWpQ2DXTCjdWUXVuOInuxb84NKD9wTWL3Fw4bIsz2zQIZcRIBjK8x8SG58ggbKjyHfkGNHSIGqm9IHqB8gAvdvXx/cgQCh/dMREMJAgA7",
		activeSrc: "data:image/gif;base64,R0lGODlhHAAeANU/AJ+go4aZtKK2111cXT2g1thLFqfN5DCBuliLwPz6+YOf0e3s7NHR0bS0tODg35aly3l5eIC21TEyMmqZzouKjIKJnMjJyb3c7j2t20K452CBrnONuy6L2UlNTyBZpKSwvDWVzD94riCJxVO16tLd5vLx8UJ2uSFlp1xviefl5BtztNfX1r28uqysrMHAwFOx2tzb2zOm5W1tbfL2+vb19MXR4Hes55tELxdTmtjFvLfC3WGVypSVmNvm9IV+gf///yH5BAEAAD8ALAAAAAAcAB4AAAb/wJ9wOCxZGJYEccls/iwWWCPlrDJpLVeLAVtxS9amg7FIJBap1GKxYq3CwkUyYaHIBviBjOfSLqxdCQ0yMhAUFBUVFBAyHRAAPAxODA4LPjKIAQ+bDwoBFTx3EBAWTDBRMj48Gw8CNToCsQIPoBR6Mm9DCVuYq5sKrpybAhqgeBBKQg0sPhQAGwrR0Z2eAZ4+Gjw8ei1CNBQ8EC0a0tETNQob6hQ3GgEaLRADEGDMjwE7ChP7Ezs9OhoQ+CiAQt2GAC0G+GCRYJGPBgER7Nixzx+JCQMHINAQQoOGBqN4OGDE40PHgBMNCEAQYuCNk5o2NNjGwwIjAAE6hghxQMWE/xA4bhS48YFEDYPuElJocKlFzhMeTpzYYUDFhxw3Ohi4gAAqjhMBWMxrsKhBAA/qTBiYQSLCAhYoQEQQAaKuChUBXOhxEa5BCxOsTCA4MGFBAxQiIlx4QYAAiAMHPojFxcNHixYHEJiAfKAGRMUvMITG8PiAlg4yaGjjs4MuCBECWoRIPAMEAQy4X09YQcHRjwYAZDD4UFcugAPFLzTOkAGDYwsrBnRo8MOSjAYwIjQOYLsxCA4cCDBvHCEFAAkdwPwAIA9GdtsjcGPgYGMCB+YxyjPoIIFHkTs+LOBABMwVGJ4N92VQXgoDoEcDERZ00AEFC5RQQwQjFBhDhhHUQFaDAw1KIMkSDfAnXAIlkGDAigaQQAINNLDAnwTUNVGiBBJQYEEJZphBQwqD4DidFQzIgKME84Bjh4QS4gJHCUEK2UEeYz0IhxAlMNACBT5A0MwWVjIRBAA7",
		alt: "test image",
		decorative: false
	});

	new MImage({
		src: "../images/SAPLogo.jpg",
		alt: "test image",
		width: "36px",
		height: "46px",
		mode: ImageMode.Background,
		backgroundSize: "150px 74px",
		backgroundPosition: "-74px -14px",
		decorative: false
	}).placeAt("uiArea9");

	oImage.placeAt("uiArea1");
	oImageWithoutDensityAware.placeAt("uiArea2");
	i3.placeAt("uiArea3");
	oImage1.placeAt("uiArea4");
	oImageButton.placeAt("uiArea5");
	oDataImage.placeAt("uiArea8");
});
