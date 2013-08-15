package com.sap.web.controller;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.Gson;
import com.sap.model.Response;
import com.sap.service.ImageService;

@Controller
@RequestMapping("/config")
public class ConfigController {
	
	@Resource
	private ImageService imageService;
	
	/**
	 * Get all token information
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.GET)
	public String getAllTokenInformation() {
		Response response = imageService.getAllTokenInformation();
		Gson gson = new Gson();
		return gson.toJson(response);
	}
	
	/**
	 * Save or update token information
	 * @param formData
	 * @return
	 */
	@ResponseBody
	@RequestMapping(method = RequestMethod.PUT)
	public String saveOrUpdateConfigInfomation(@RequestBody MultiValueMap<String, String> formData) {
		Map<String, String> data = new HashMap<String, String>();
		for (String key : formData.keySet()) {
			data.put(key, formData.getFirst(key));
		}
		Response response = imageService.saveOrUpdateConfigInfo(data);
		Gson gson = new Gson();
		return gson.toJson(response);
	}
	
	

}
