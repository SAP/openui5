package com.sap.ui5.webviewer.web.controller;

import java.util.List;

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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.google.gson.Gson;
import com.sap.ui5.webviewer.model.Response;
import com.sap.ui5.webviewer.service.ImageService;

@Controller
@RequestMapping("/images")
public class ImageController {

	@Resource
	private ImageService imageService;

	/**
	 * Load whole directories structure
	 *
	 * @return
	 */
	@ResponseBody
	@RequestMapping(value = "/folders", method = RequestMethod.GET)
	public String loadFolderTree() {
		Response response = imageService.findAllDirectories();
		Gson json = new Gson();
		return json.toJson(response);
	}

	/**
	 * Load images from the path that is given
	 *
	 * @param folder
	 *            the image path, eg: "Window7_64/Chrome/hcb/RTL_false/libaraytests/commons/CheckBoxTest"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET)
	public String getImagesFrom(@RequestParam(value = "path") String folder) {
		Response response = imageService.findImagesInFolder(folder);
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
	@RequestMapping(method = RequestMethod.DELETE)
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
		Response response = imageService.deleteImages(path, names);
		Gson json = new Gson();
		return json.toJson(response);
	}

	/**
	 * Upload image to a path that is given
	 *
	 * @param req
	 *            MultipartHttpServletRequest, contain the file inputStreams
	 * @param path
	 *            Upload path, eg:"Window7_64/Chrome/hcb/RTL_false/libaraytests/commons/CheckBoxTest/ExpectedImages"
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.POST)
	public String uploadImage(MultipartHttpServletRequest req, @RequestParam(value = "path") String path) throws ServletException {
		List<MultipartFile> files = req.getFiles("file");
		if (files == null || files.isEmpty()) {
			throw new MissingServletRequestParameterException("file", "file");
		}
		Response response = imageService.uploadImages(files, path);
		Gson json = new Gson();
		return json.toJson(response);
	}

}
