
sap.ui.define([
    "jquery.sap.global",
    "sap/m/App",
    "sap/m/Page",
    "sap/m/FlexBox",
    "sap/m/Title",
    "sap/m/Image",
    "sap/m/Text",
    "sap/m/library"
], function (jQuery, App, Page, FlexBox, Title, Image, Text, mLibrary) {
    "use strict";

    var ImageMode = mLibrary.ImageMode;

    jQuery.sap.initMobile();

    var oImage = new Image({
        id: "image_not_decorative",
        src: "images/SAPLogo.jpg",
        alt: "test image",
        densityAware: true,
        decorative: false
    });

    var oImageWithoutDensityAware = new Image({
        src: "images/SAPLogo.jpg",
        alt: "test image",
        decorative: false,
        width: "150px",
        height: "74px"
    });

    var sSrc3 = "images/SAPUI5.png",
        oImage3 = new Image("oImage3", {
            src: sSrc3,
            alt: "test image",
            densityAware: true,
            decorative: false
        });

    var oImage1 = new Image({
        src: "images/SAPLogo.jpg",
        alt: "test image",
        decorative: false,
        densityAware: true,
        press: function () {
            this.setSrc("images/SAPUI5.png");
        }
    });
    oImage1.addStyleClass("img1");

    var oImageButton = new Image({
        id: "image_button",
        src: "images/action.png",
        activeSrc: "images/action_pressed.png",
        alt: "test image",
        decorative: false,
        press: function () {
            jQuery.sap.log.info("!!!oImageButton pressed!!!");
        }
    });

    var oImageButton1 = new Image({
        src: "images/action.png",
        alt: "test image",
        decorative: false,
        press: function () {
            jQuery.sap.log.info("!!!oImageButton pressed!!!");
        }
    });
    oImageButton1.setActiveSrc("images/action_pressed.png");

    var oImageInvalid = new Image({
        id: "invalid_image",
        src: "invalid_src.png",
        alt: "test image",
        press: function () {
            //this won't be called before a valid src is set
            this.setSrc("images/action.png");
        },
        activeSrc: "images/action_pressed.png",
        width: "48px",
        height: "48px",
        decorative: false
    });

    var oDataImage = new Image({
        src: "data:image/gif;base64,R0lGODlhHwAeANU/AO1SReW2N+14Kf3YACOAulrAWtTW02Gh1uPIx/BkVFXKXu3t7bjZuoi9R7nV8fbOG8fBulSlWvh8ZlW0WvTu0aG8QqK92sGkdcWjoPr5+WyrUUaiV7q0oHWs2vrTCYOeiJ94QulCOYK34ceNifHEJfLWRuLf3tomHUWUzeQxLf/cDc1+dtzCOqKzo83o92mxbPSSjP/ohspCL2K1WG7Ga+k5NIGfWcbKKcu5ceTPBvDKAJfRkIyvjVvEXeV4af///yH5BAEAAD8ALAAAAAAfAB4AAAb/wJ9wSPwtDBCMEmJYFJ/QXwYx8kmuWIlvBMlEoaZVIptNmBMrw5eIObvfZkACgFn/MIA8/J3vj74jfYJycYMAIYh/TxCIiIaGjYg1NRBFCzYhNZGbk42TNSmhmiZELQogKZ+SNQkwrhICsbKzF0MLLwozMqmTKQAICy7CCxQlOg8PHh4DAyoPTj8QPQWnoikJCw4i29sOGSXKzOIqlT88CgXTuykhJg4HHdwdBxYUKuLjOFIv09Q2JydguIDXoaDBAw5i4GOmgkWGW/2ogTiBQASKAxgzHkAhgsLCZs8WzIjYQ4MMBBs1Zrxo7+MDEyILyJR5CiWKmzhxHmi58OWtzJkye8xA0IFATpwEOnj8SGJBhhdAZ+5wQMBozqoJPw5waC5qUANFq4pNylOcBxX6ok3wWoCGAQtjCVgwUWKhsgflfrKlweCtBQsGGFT46OFBAGg/WkxYu3eH4xcRcuC7+4ADkQURFrOduXiw2cKGEQuBkJkx2wkzlg1QVpgEiXJFWpQ2DXTCjdWUXVuOInuxb84NKD9wTWL3Fw4bIsz2zQIZcRIBjK8x8SG58ggbKjyHfkGNHSIGqm9IHqB8gAvdvXx/cgQCh/dMREMJAgA7",
        activeSrc: "data:image/gif;base64,R0lGODlhHAAeANU/AJ+go4aZtKK2111cXT2g1thLFqfN5DCBuliLwPz6+YOf0e3s7NHR0bS0tODg35aly3l5eIC21TEyMmqZzouKjIKJnMjJyb3c7j2t20K452CBrnONuy6L2UlNTyBZpKSwvDWVzD94riCJxVO16tLd5vLx8UJ2uSFlp1xviefl5BtztNfX1r28uqysrMHAwFOx2tzb2zOm5W1tbfL2+vb19MXR4Hes55tELxdTmtjFvLfC3WGVypSVmNvm9IV+gf///yH5BAEAAD8ALAAAAAAcAB4AAAb/wJ9wOCxZGJYEccls/iwWWCPlrDJpLVeLAVtxS9amg7FIJBap1GKxYq3CwkUyYaHIBviBjOfSLqxdCQ0yMhAUFBUVFBAyHRAAPAxODA4LPjKIAQ+bDwoBFTx3EBAWTDBRMj48Gw8CNToCsQIPoBR6Mm9DCVuYq5sKrpybAhqgeBBKQg0sPhQAGwrR0Z2eAZ4+Gjw8ei1CNBQ8EC0a0tETNQob6hQ3GgEaLRADEGDMjwE7ChP7Ezs9OhoQ+CiAQt2GAC0G+GCRYJGPBgER7Nixzx+JCQMHINAQQoOGBqN4OGDE40PHgBMNCEAQYuCNk5o2NNjGwwIjAAE6hghxQMWE/xA4bhS48YFEDYPuElJocKlFzhMeTpzYYUDFhxw3Ohi4gAAqjhMBWMxrsKhBAA/qTBiYQSLCAhYoQEQQAaKuChUBXOhxEa5BCxOsTCA4MGFBAxQiIlx4QYAAiAMHPojFxcNHixYHEJiAfKAGRMUvMITG8PiAlg4yaGjjs4MuCBECWoRIPAMEAQy4X09YQcHRjwYAZDD4UFcugAPFLzTOkAGDYwsrBnRo8MOSjAYwIjQOYLsxCA4cCDBvHCEFAAkdwPwAIA9GdtsjcGPgYGMCB+YxyjPoIIFHkTs+LOBABMwVGJ4N92VQXgoDoEcDERZ00AEFC5RQQwQjFBhDhhHUQFaDAw1KIMkSDfAnXAIlkGDAigaQQAINNLDAnwTUNVGiBBJQYEEJZphBQwqD4DidFQzIgKME84Bjh4QS4gJHCUEK2UEeYz0IhxAlMNACBT5A0MwWVjIRBAA7",
        alt: "test image",
        densityAware: true,
        decorative: false
    });

    var oBGImage1 = new Image({
        src: "images/SAPLogo.jpg",
        alt: "test image",
        width: "36px",
        height: "46px",
        mode: ImageMode.Background,
        backgroundSize: "150px 74px",
        backgroundPosition: "-74px -14px",
        densityAware: true,
        decorative: false
    });

    var oBGImage2 = new Image({
        src: "images/SAPLogo.jpg",
        alt: "test image",
        width: "30px",
        height: "50px",
        mode: ImageMode.Background,
        backgroundSize: "contain",
        backgroundPosition: "center top",
        densityAware: true,
        decorative: false
    });

    new App({
        pages: [
            new Page({
                content: [
                    new Title({ level: "H3", text: "If this page runs in a high density device, you could see the difference between the two images." }),
                    new FlexBox({
                        items: [oImage, new Text({ text: "This image is density aware, it loads the high resolution version when it runs in a high density device." })]
                    }),
                    new FlexBox({
                        items: [oImageWithoutDensityAware, new Text({ text: "This image is NOT density aware, it always loads the default version no matter what device it runs on." })]
                    }),
                    new FlexBox({
                        items: [oImage3, new Text({ text: "There's only one version of this image available, so the high density device tries first to load the high resolution version and then falls back to this version." })]
                    }),
                    new FlexBox({
                        items: [oImage1, new Text({ text: "This image has a width value that is set from the css, and it will not resize in high density device." })]
                    }),
                    new FlexBox({
                        items: [oImageButton, new Text({ text: "This image has an active state, when you press this image the src will be changed to the activeSrc property." })]
                    }),
                    new FlexBox({
                        items: [oImageButton1, new Text({ text: "This image has an active state but it's not density aware, when you press this image the src will be changed to the activeSrc property." })]
                    }),
                    new FlexBox({
                        items: [oImageInvalid, new Text({ text: "This image is set first to a non valid src but the space is reserved, and the src will be changed to a valid image source on click." })]
                    }),
                    new FlexBox({
                        items: [oDataImage, new Text({ text: "The src property of this image is in data uri format, it won't load higher density version in high density device." })]
                    }),
                    new FlexBox({
                        items: [oBGImage1, new Text({ text: "The SAP Logo image is set as background of the dom element. The letter 'P' is extracted from the logo by using the backgroundPosition. In order to display the high density correctly, the backgroundSize property needs to be set with the dimension of normal density version." })]
                    }),
                    new FlexBox({
                        items: [oBGImage2, new Text({ text: "The SAP Logo image is set as background of the dom element. It adjusts its width and height proportionally until it is fully contained in the applied size." })]
                    })
                ]
            })
        ]
    }).placeAt('content');
});