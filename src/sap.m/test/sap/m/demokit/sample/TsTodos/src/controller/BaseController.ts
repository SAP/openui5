import Controller from "sap/ui/core/mvc/Controller";
import AppComponent from "../Component";
import Model from "sap/ui/model/Model";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import JSONModel from "sap/ui/model/json/JSONModel";

/**
 * @namespace sap.m.sample.TsTodos.webapp.controller
 */
export default abstract class BaseController extends Controller {

	/**
	 * Convenience method for accessing the component of the controller's view.
	 * @returns The component of the controller's view
	 */
	public getOwnerComponent(): AppComponent {
		return (super.getOwnerComponent() as AppComponent);
	}

	/**
	 * Convenience method for getting the i18n resource bundle of the component.
	 * @returns The i18n resource bundle of the component
	 */
	public getResourceBundle(): ResourceBundle {
		const oModel = this.getOwnerComponent().getModel("i18n") as ResourceModel;
		return (oModel.getResourceBundle() as ResourceBundle);
	}

	/**
	 * Convenience method for getting the view model by name in every controller of the application.
	 * @param [sName] The model name
	 * @returns The model instance
	 */
	public getModel(sName?: string) : JSONModel {
		return (this.getView().getModel(sName) as JSONModel);
	}

	/**
	 * Convenience method for setting the view model in every controller of the application.
	 * @param oModel The model instance
	 * @param sName The model name
	 * @returns The current base controller instance
	 */
	public setModel(oModel: Model, sName?: string) : BaseController {
		this.getView().setModel(oModel, sName);
		return this;
	}
}