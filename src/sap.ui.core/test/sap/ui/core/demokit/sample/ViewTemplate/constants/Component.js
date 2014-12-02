//Copyright (c) 2014 SAP SE, All Rights Reserved
/**
 * @fileOverview Application component to display constant expressions.
 * @version @version@
 */
jQuery.sap.declare("sap.ui.core.sample.ViewTemplate.constants.Component");

jQuery.sap.require("sap.ui.core.util.MockServer");
jQuery.sap.require("sap.ui.model.odata.AnnotationHelper");

sap.ui.core.UIComponent.extend("sap.ui.core.sample.ViewTemplate.constants.Component", {
	metadata: "json", //TODO Use component metadata from manifest file

	createContent: function () {
		var sUri
			= "/testsuite/test-resources/sap/ui/core/demokit/sample/ViewTemplate/constants/data/",
			oMockServer = new sap.ui.core.util.MockServer({rootUri: sUri}),
			oModel = new sap.ui.model.json.JSONModel({
				MyAddress: {
					"vCard.Address#work": {
						Street: "MyAddress/vCard.Address#work/Street"
					}
				}
			}),
			oMetaModel = new sap.ui.model.json.JSONModel(),
			sLogoGold = "iVBORw0KGgoAAAANSUhEUgAAAEMAAAAhCAYAAACC9hYiAAACf0lEQVR42u1Z223EIBCkhbRwLVwL1wItXAtugRZSQH5IUoFbcAu0gK4Dxzycs-zA7AL2KZKRVpFy5jXszoyxEGc7G7k9PsTbQ4v741PoKcwU4yKs_58W_fRXTSHd86zxw9jdHyFJ_b_FLdF_G2Eu6ft8iwsPhC_xvto8LRw408RwDrew3DiEBRev8XmYelrrFaFtKyaZwwAwhmz_aaM7g7EMvclqh1KjwV10mfK4kk4OlF1DMEZ_OPN8vjS2vLBXVmjiOOpAMHyGzAvsGLVmQb3fMmV4YdV1Jjt2ACOsHdawA2u1sLgxGU_azgQKskI1K7c8GHalKCoq3wi5KnvaFDILZdblVCA-Y1uVHADDFKmY64ce4HqIxEK6Qrm-twIjEng2QwSpfp1xqQAFELRln3IpGIBrKJzxXLQbLGdWytIT_t4MDKBmszVmS6gnJopbzIOtCc8MTTgD85ahuULk4hKgQJMVpZhg0W81YHj1w4qil1JpWjtPkJZm9azNvfcwfcawCMMm65hGugqQhRRDk7VSCqg4C67awXSZ3AvbUJshwGRtHGY8DJzGe4CRcc7Peg-TWvYrMiKrhJmDm4zc1BgMyfMJgQgVGRhEVikzhZQtgtgIjIFrE_gL5smzjhvTZKKruYByc7i-qCxYgOzx1kgPhaTVk_cquJZZRdQoRkq_EAzLkeyyC-Btzcs1MFEu1QuBqL5gomUFPo3xn0Q5GMwbqFr27hk37f3xYBxHhnJRktI7Tjd3mF_FC6LbbMYqDsnUlIhuRGrZ3wtlvD-eM9wplLrN0K-rue0G33KOBSPx6S79aTF8kfq9_YpprpPB1fltGWtyEO5tz3a2sxW3H4n8CJEWdLWwAAAAAElFTkSuQmCC",
			sLogoBlue = "iVBORw0KGgoAAAANSUhEUgAAAEIAAAAhCAMAAABa6o0uAAAAn1BMVEX___8AZrMAru8ArO4ApecAnuEAl9sAkNYAitEAfsYAhs0AecJAjMYAg8u_5PUAgMgAbbgAcLpjodGAs9m_2e3v9vuAv-OAut9Akcrf7ve_3_Gv1-5gp9XP5PLP6_iPxOQggcOfy-aPvd5jzfVgs-BQlst4rtdQntEdfL-v0Ogwh8RQrN1wvuUgmdaf0-6Axeio4_qPz-4wpd5jrtpwuOCoNfAmAAAB1ElEQVRIiaWR63qCMAxAw24isEmn3HWoYyrgZdO9_7MtbQoU7cDv4_yQNEkPicDDUL5hqOET4OFxEGiAp0FwAzwPQRjgZQB7YYAR8rL_EPHHTzYSHN84JQ-zN0lyOo_aSAOMTDPzoMbbm6Z5oPiIoXlqahCVpkJWpQ9WBiqlZVnymoeh5beqmVXTXDsfPLUnfkWi6gLGbQWcXyXKi8tfmtH3_QRlh8lksq1qCR5IEcexXG5CqKNfEvGwxpyLz3-PdRGzpMAsTRuNqVGd7EL6FTk4VrPZr6JQorYB5ik9vTS0CaqL4Ra2HYgTzzdR2wDbenOI0oI3iLEWlA6bi8uoiq4M2LRSTgG20n478UilIghWtF5yawCbMdWxYnSnYLkYTB6bvdn82sAVLIyVHjHvgsnWbVsRawxCwdhys5BnmjfAFE3VUuS2xgDMlSxzNR3NZLCuU14eujoDV8xtkujKQN8hDEPeoTXAzg3Bmxaua6-1dYLe8a4vOu5MX7hV6GfAEZ3bXLSeIbniNpB_ZgD40sy_NgRFS_GvAWzDqT-FN6U_b0kKI6q7ugzgYitzppwvw3AE0mAUTkWXQSj66TLcp-g03KXoNtyj6DHcoegzQK9h02f4A-ywLENIMAbXAAAAAElFTkSuQmCC";

		oMockServer.start();
		oMetaModel.loadData(sUri + "miscellaneous.json", undefined, /*bAsync*/false);
		//add interesting annotations not contained in the original miscellaneous.json
		oMetaModel.setProperty("/schemas/org.example2/annotations/0/@Some.ImageData.Binary#Blue", {
			"@odata.type": "#Binary",
			"value": sLogoBlue
		});
		oMetaModel.setProperty("/schemas/org.example2/annotations/0/@Some.ImageData.Binary#Gold", {
			"@odata.type": "#Binary",
			"value": sLogoGold
		});

		return sap.ui.view({
			preprocessors: {
				xml: {
					models: {meta: oMetaModel}
				}
			},
			type: sap.ui.core.mvc.ViewType.XML,
			viewName: "sap.ui.core.sample.ViewTemplate.constants.Template",
			bindingContexts: oModel.createBindingContext("/"),
			models: oModel
		});
	}
});
