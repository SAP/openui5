package com.sap.web.controller;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import com.sap.service.ImageService;

@Controller
@RequestMapping(value = "/modules")
public class ModuleController {
	@Resource
	private ImageService imageService;

	/**
	 * Get whole test results from modules
	 * 
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET)
	public String getModuleResults() {
		Gson json = new Gson();
		return json.toJson(imageService.countResultByMoudle());
	}

	/**
	 * Get failed controls under a module
	 * 
	 * @param module
	 *            eg: "libarytests"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/{module}/failedControls", method = RequestMethod.GET)
	public String getFailedControls(@PathVariable String module) {
		Gson json = new Gson();
		return json.toJson(imageService.findFailedControlsByModule(module));
	}

	/**
	 * Get information about test conditions that make control failed
	 * @param module
	 *               eg: "libaraytests"
	 * @param subModule
	 *               eg: "commons"
	 * @param control
	 *               eg: "CheckBoxTest"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/{module}/{subModule}/{control}", method = RequestMethod.GET)
	public String getFailedInfoByController(@PathVariable String module, @PathVariable String subModule,
			@PathVariable String control) {
		Gson json = new Gson();
		return json.toJson(imageService.findFailedInfoByController(module, subModule, control));
	}

}
