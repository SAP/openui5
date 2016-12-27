package com.sap.openui5;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;


/**
 * The <class>VersionServlet</code> is used to generate the
 * <code>sap-ui-version.json</code> file from the available
 * libraries which have been discovered by th
 * <code>DiscoveryService</code>.
 * <p>
 * <i>This class must not be used in productive systems.</i>
 *
 * @author Peter Muessig
 */
public class VersionServlet extends HttpServlet {


  /** serial version UID */
  private static final long serialVersionUID = 871780271601582635L;


  /* (non-Javadoc)
   * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
   */
  @Override
  protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    DiscoveryService discovery = DiscoveryService.getInstance(this.getServletContext());
    if (discovery == null) {
      throw new ServletException("The VersionServlet requires the DiscoveryService which must be registered as ServletContextListener for this web application!");
    }

    response.setCharacterEncoding("UTF-8");
    response.setContentType("application/json");
    response.setStatus(HttpServletResponse.SC_OK);

    PrintWriter writer = response.getWriter();
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    writer.write(gson.toJson(discovery.getVersionInfo()));
    writer.flush();
    writer.close();

  } // method: doGet


} // class: VersionServlet
