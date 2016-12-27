package com.sap.openui5;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sap.openui5.DiscoveryService.Entry;
import com.sap.openui5.DiscoveryService.TestPage;


/**
 * The <class>DiscoveryServlet</code> is to return the information
 * what kind of web application pages, test pages or libararies are
 * part of the current web application.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public class DiscoveryServlet extends HttpServlet {


  /** serial version UID */
  private static final long serialVersionUID = -2150070019181955209L;


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    String path = request.getPathInfo();

    Map<String, Object> content = new HashMap<String, Object>();
    String contentType = "application/json";

    DiscoveryService discovery = DiscoveryService.getInstance(this.getServletContext());
    if (discovery == null) {
      throw new ServletException("The DiscoveryServlet requires the DiscoveryService which must be registered as ServletContextListener for this web application!");
    }

    if ("/app_pages".equals(path)) {
      List<Entry> appPages = discovery.getAppPages();
      content.put(path.substring(1), appPages);
    } else if ("/all_libs".equals(path)) {
      List<Entry> libs = discovery.getAllLibraries();
      content.put(path.substring(1), libs);
    } else if ("/all_tests".equals(path)) {
      List<TestPage> pages = discovery.getTestpages();
      content.put(path.substring(1), pages);
    } else {
      response.setStatus(HttpServletResponse.SC_NOT_FOUND);
      return;
    }

    response.setCharacterEncoding("UTF-8");
    response.setContentType(contentType);
    response.setStatus(HttpServletResponse.SC_OK);

    PrintWriter writer = response.getWriter();
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    writer.write(gson.toJson(content));
    writer.flush();
    writer.close();

  } // method: doGet


} // class: DiscoveryServlet
