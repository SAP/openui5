package com.sap.web.controller;

import javax.annotation.Resource;
import javax.servlet.ServletException;

import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import com.sap.model.Response;
import com.sap.service.ImageService;

@Controller
@RequestMapping("/jobs")
public class JobController {

	@Resource
	private ImageService imageService;

	/**
	 * Load whole test results by job
	 * 
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET)
	public String getJobsResults() {
		Gson json = new Gson();
		return json.toJson(imageService.countResultByJob());
	}

	/**
	 * Get failed controllers from current job path that is given
	 * 
	 * @param path
	 *            job path, eg:"Window7_64/Chrome/goldrefection/RTL_false"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/failedControllers", method = RequestMethod.GET)
	public String getFailControllers(@RequestParam(value = "path") String path) {
		Response response = imageService.findFailedControllersByPath(path);
		Gson json = new Gson();
		return json.toJson(response);
	}

	/**
	 * Get compared failure images from a path which is given
	 * 
	 * @param path
	 *            failed image path, eg:"Window7_64/Chrome/goldrefection/RTL_false/libarytests/commons/CheckBoxTest"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/failedImages", method = RequestMethod.GET)
	public String getFailedImages(@RequestParam(value = "path") String path) {
		Response response = imageService.findFailedImages(path);
		Gson json = new Gson();
		return json.toJson(response);
	}

	/**
	 * Update images from the path which is given. Replace expected image with need verify images.
	 * 
	 * @param formData
	 *            formData.path: the image path, eg: "Window7_64/Chrome/hcb/RTL_false/libaraytests/commons/CheckBoxTest"
	 *            formData.imageNames : the image names, eg: "test1.png,test2.png"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/failedImages", method = RequestMethod.PUT)
	public String updateImages(@RequestBody MultiValueMap<String, String> formData) throws ServletException {
		String path = formData.getFirst("path");
		String imageNames = formData.getFirst("imageNames");
		if (path == null || "".equals(path)) {
			throw new MissingServletRequestParameterException("path", "string");
		}
		if (imageNames == null || "".equals(imageNames)) {
			throw new MissingServletRequestParameterException("imageNames", "string");
		}
		String[] names = imageNames.split(",");
		Response response = imageService.updateImages(path, names);
		Gson json = new Gson();
		return json.toJson(response);
	}

	/**
	 * Delete images by name from the path that is given
	 * 
	 * @param formData
	 *            formData.path: the image path, eg: "Window7_64/Chrome/hcb/RTL_false/libaraytests/commons/CheckBoxTest"
	 *            formData.imageNames : the image names, eg: "test1.png,test2.png"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/failedImages", method = RequestMethod.DELETE)
	public String deleteImages(@RequestBody MultiValueMap<String, String> formData) throws ServletException {
		String path = formData.getFirst("path");
		String imageNames = formData.getFirst("imageNames");
		if (path == null || "".equals(path)) {
			throw new MissingServletRequestParameterException("path", "string");
		}
		if (imageNames == null || "".equals(imageNames)) {
			throw new MissingServletRequestParameterException("imageNames", "string");
		}
		String[] names = imageNames.split(",");
		Response response = imageService.deleteFailedImages(path, names);
		Gson json = new Gson();
		return json.toJson(response);
	}
}
