## LISA cluster map example ##

# Source: Guerry's 'Moral statistics in 1830 France'
# Link: https://geodacenter.github.io/workbook/6a_local_auto/lab6a.html

# load packages
library(spdep) ; library(tmap) ; library(leaflet)

# load function
source("functions/lisa_stats.R")

# load data
url <- "https://s3.amazonaws.com/geoda/data/guerry.zip"
download.file(url, dest = "guerry.zip")
unzip("guerry.zip")
file.remove("guerry.zip")
gfrance85 <- readOGR("Guerry.geojson", layer="OGRGeoJSON")

# plot map with natural breaks
tm_shape(gfrance85) +
  tm_polygons("Donatns", style = "jenks", n = 6,
              title = "Natural breaks") +
  tm_layout("Guerry (1833) \nCharitable donations per capita")

# create neighbours list (first order queen contiguity)
nb <- poly2nb(gfrance85, queen = TRUE, row.names = gfrance85$Dprtmnt)

# construct row standardised spatial weights matrix
listw <- nb2listw(nb, style = "W")

# calculate Global Moran's I
moran.test(gfrance85$Donatns, listw = nb2listw(nb))

# create Moran's I scatterplot
moran.plot(gfrance85$Donatns, listw = nb2listw(nb), labels = gfrance85$Dprtmnt,
           xlab = "Donations", ylab = "Lagged donations")

# calculate Monte-Carlo simulation of Moran's I
moran.mc(gfrance85$Donatns, listw = nb2listw(nb), nsim = 100)
plot(moran.mc(gfrance85$Donatns, listw = nb2listw(nb), nsim = 100))

# calculate LISA statistics for cluster map
gfrance85_lisa <- lisa_stats(gfrance85, variable = "Donatns", queen = TRUE, sig = 0.05)

# plot LISA cluster map
factpal <- colorFactor(c("#F0F0F0", "#E93F36", "#2144F5", "#9794F8", "#EF9493"),
                       levels = c("Not significant", "High-High", "Low-Low", "Low-High", "High-Low"),
                       ordered = TRUE)

leaflet() %>% 
  addProviderTiles("CartoDB.Positron") %>% 
  addPolygons(data = gfrance85_lisa, fillColor = ~factpal(quad_sig), fillOpacity = 1, 
              stroke = TRUE, color = "black", weight = 1, layerId = ~Dprtmnt,
              label = ~quad_sig,
              highlight = highlightOptions(color = "#FFFF00", weight = 3, opacity = 1, bringToFront = TRUE)) %>%
  addLegend(position = "bottomleft", colors = c("#f0f0f0", "red", "blue", "cyan", "pink"),
            labels = c("Non-sig", "High-High", "Low-Low", "Low-High", "High-Low"), opacity = 0.8,
            title = "LISA cluster map")
