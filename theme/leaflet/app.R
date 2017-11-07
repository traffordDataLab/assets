## Leaflet map template ##

library(shiny) ; library(tidyverse) ; library(sf) ; library(leaflet) ; library(htmltools)

# Load data ---------------------------

# IMD 2015 by LSOA (source: Department for Communities and Local Government)
lsoa <- st_read("data/IMD_2015.geojson")

# Local Authority boundaries (source: ONS Open Geography Portal)
la <- st_read("data/local_authorities.geojson")

# Plot data ---------------------------

ui <- bootstrapPage(
  tags$head(tags$style(
    type = "text/css",
    "html, body {width:100%;height:100%}",
    "#controls {background-color: white; padding: 0 20px 20px 20px; border-radius: 15px; opacity: 0.85;}")),
  leafletOutput("map", width = "100%", height = "100%"),
  absolutePanel(id = "controls", class = "panel panel-default", fixed = TRUE, draggable = TRUE, top = 10, left = "auto", right = 20, bottom = "auto", width = 350, height = "auto",
                h4("Index of Multiple Deprivation (2015)"),
                tags$a(href="https://www.gov.uk/government/statistics/english-indices-of-deprivation-2015", "Data source"),
                hr(),
                uiOutput("info")))

server <- function(input, output, session) {
  values <- reactiveValues(highlight = c())
  
  observe({
    values$highlight <- input$map_shape_mouseover$id
  })

  output$info <- renderUI({
    if (is.null(values$highlight)) {
      return(tags$h4("Hover over an LSOA"))
    } else {
      lsoaName <- lsoa$lsoa11cd[values$highlight == lsoa$lsoa11cd]
      return(tags$div(
        tags$h4(lsoa[lsoa$lsoa11cd == lsoaName,]$wd15nm),
        tags$h5("Ward:", lsoa[lsoa$lsoa11cd == lsoaName,]$wd15nm),
        tags$h5("Local Authority:", lsoa[lsoa$lsoa11cd == lsoaName,]$lad15nm),
        br(),
        HTML("<table style='width: 100%'>
               <tr>
               <th>Decile</th>
               <th>Score</th>
               <th>Rank</th>
               </tr>
               <tr>
               <td style='width: 33%'>", lsoa[lsoa$lsoa11cd == lsoaName,]$decile, "</td>
               <td style='width: 34%'>", lsoa[lsoa$lsoa11cd == lsoaName,]$score, "</td>
               <td style='width: 33%'>", formatC(lsoa[lsoa$lsoa11cd == lsoaName,]$rank, format="f", big.mark = ",", digits=0), "</td>
               </tr>
               </table>")
      ))
    }
  })
  
  output$map <- renderLeaflet({
    leaflet() %>% 
      addTiles(urlTemplate = "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
               attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://cartodb.com/attributions">CartoDB</a> | <a href="https://www.ons.gov.uk/methodology/geography/licences">Contains OS data © Crown copyright and database right (2017)</a>',
               group = "CartoDB",
               options = providerTileOptions(minZoom = 10, maxZoom = 14)) %>% 
      addTiles(urlTemplate = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
               attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
               group = "OpenStreetMap",
               options = providerTileOptions(minZoom = 10, maxZoom = 14)) %>% 
      addTiles(urlTemplate = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", 
               attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community | <a href="https://www.ons.gov.uk/methodology/geography/licences"> Contains OS data © Crown copyright and database right (2017)</a>', 
               group = "Satellite",
               options = providerTileOptions(minZoom = 10, maxZoom = 14)) %>%
      addTiles(urlTemplate = "", 
               attribution = '<a href="https://www.ons.gov.uk/methodology/geography/licences">Contains OS data © Crown copyright and database right (2017)</a>',
               group = "No background") %>% 
      setView(-2.28417866956407, 53.5151885751656, zoom =11) %>% 
      addEasyButton(easyButton(icon='fa-home', title='Reset',
                               onClick=JS("function(btn, map){ map.setView([53.5151885751656, -2.28417866956407], 11);}"))) %>% 
      addLayersControl(position = 'topleft',
                       baseGroups = c("CartoDB", "OpenStreetMap", "Satellite", "No background"),
                       options = layersControlOptions(collapsed = TRUE)) %>% 
      htmlwidgets::onRender(
        " function(el, t) {
        var myMap = this;
        myMap._container.style['background'] = '#ffffff';
  }")
  })
  
  observe({
    pal <- colorFactor(c("#A31A31", "#D23B33", "#EB6F4A", "#FCB562", "#F4D78D", "#D8E9EC", "#AAD1DE", "#75A8C8", "#4D77AE", "#353B91"), domain = 1:10, ordered = TRUE)
    html_logo <- "<img src='https://trafforddatalab.github.io/assets/logo/trafforddatalab_logo.svg' style='width: 93px;'>&nbsp;<a href='https://trafforddatalab.github.io/assets/theme/leaflet/script.R' target='_blank'>
    <span style='color:#fc6721;' class='fa fa-code' title='View the source code'></span></a>"
    
    leafletProxy("map", data = lsoa) %>%
      clearShapes() %>% clearControls() %>% clearMarkers() %>% 
      addPolygons(data = lsoa, fillColor = ~pal(decile), fillOpacity = 0.7, weight = 0.7, opacity = 1, color = "#757575", layerId = ~lsoa11cd,
                  highlight = highlightOptions(color = "#FFFF00", weight = 3, bringToFront = TRUE)) %>%
      addPolylines(data = la, stroke = TRUE, weight = 3, color = "#212121", opacity = 1) %>% 
      addLabelOnlyMarkers(data = la, lng = ~centroid_lng, lat = ~centroid_lat, label = ~as.character(lad16nm), 
                          labelOptions = labelOptions(noHide = T, textOnly = T, direction = "bottom",
                                                      style = list(
                                                        "color"="white",
                                                        "text-shadow" = "-1px -1px 10px #757575, 1px -1px 10px #757575, 1px 1px 10px #757575, -1px 1px 10px #757575"))) %>%
      addLegend(position = "bottomleft", 
                colors = c("#A31A31", "#D23B33", "#EB6F4A", "#FCB562", "#F4D78D", "#D8E9EC", "#AAD1DE", "#75A8C8", "#4D77AE", "#353B91"),
                title = "IMD Deciles (2015)",
                labels = c("10% most deprived", "2","3","4","5","6","7","8","9", "10% least deprived"), opacity = 0.7) %>%
      addControl(html = html_logo, position = "bottomright")
  })
}

shinyApp(ui, server)