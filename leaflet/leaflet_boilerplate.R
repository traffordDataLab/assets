## Leaflet map boilerplate ##

# load libraries
library(tidyverse) ; library(sf) ; library(leaflet) ; library(htmltools)

# load vector boundary layer (Source: ONS Open Geography Portal)
bdy <- st_read("https://ons-inspire.esriuk.com/arcgis/rest/services/Administrative_Boundaries/Local_Authority_Districts_December_2017_Boundaries/MapServer/3/query?where=lad17cd=%27E08000009%27&outFields=*&outSR=4326&f=geojson")

# load address data
df <- data.frame(name = c("Trafford Town Hall", "Trafford Data Lab"),
                 address = c("Talbot Road, Stretford, Manchester", "Sale Point, 126-150 Washway Rd, Sale"), 
                 postcode = c("M32 0TH", "M33 6AG"), 
                 stringsAsFactors = FALSE) 

# load postcode data (Source: ONS Postcode Directory)
postcodes <- read_csv("https://www.trafforddatalab.io/spatial_data/postcodes/trafford_postcodes_2018-11.csv")

# match postcodes to retrieve coordinates
geo <- left_join(df, postcodes, by = "postcode")

# convert to spatial object
sf <- geo %>% st_as_sf(crs = 4326, coords = c("lon", "lat"))

# create popup
popup <- ~paste0(
  "<div class='popupContainer'>",
  "<h3>", sf$name, "</h3>",
  "<table class='popupLayout'>",
  "<tr>",
  "<td>Address</td>",
  "<td>", sf$address, "</td>",
  "</tr>",
  "<td>Postcode</td>",
  "<td>", sf$postcode, "</td>",
  "</tr>",
  "</table>",
  "</div>"
)

# create map
map <- leaflet(height = "100%", width = "100%") %>% 
  setView(-2.35533522781156, 53.419025498197, zoom = 12) %>% 
  addProviderTiles(providers$CartoDB.Positron) %>% 
  addPolylines(data = bdy, stroke = TRUE, weight = 2, color = "#212121", opacity = 1) %>% 
  addMarkers(data = sf, popup = popup) %>% 
  addControl("<strong>Title</strong><br /><em>Source: </em>", position = 'topright')

# apply CSS
browsable(
  tagList(list(
    tags$head(
      tags$style("
                 html, body {height: 100%;margin: 0;}
                 .leaflet-control-layers-toggle {height: 44; width: 44;}
                 .leaflet-bar a, .leaflet-bar a:hover, .leaflet-touch .leaflet-bar a, .leaflet-touch .leaflet-bar a:hover {height: 34px; width: 34px; line-height: 34px;}
                 .info {width: 300px;}
                 .popupContainer{overflow: scroll;}
                 .popupLayout{width: 100%;}
                 .popupLayout td{vertical-align: top; border-bottom: 1px dotted #ccc; padding: 3px;}
                 .popupLayout td:nth-child(1){width: 1%; font-weight: bold; white-space: nowrap;}
                 ")
      ),
    map
      ))
  )