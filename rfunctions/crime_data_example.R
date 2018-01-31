## Example: crime / ASB within 500 metres of Trafford Town Hall

# load the necessary R packages and Lab R functions
library(tidyverse); library(sf) ; library(leaflet)
source("https://github.com/traffordDataLab/assets/raw/master/rfunctions/crime_data.R")

# create a 500m buffer from a pair of coordinates
buffer <- c(-2.287333, 53.458472) %>%
  st_point() %>%
  st_sfc(crs = 4326) %>%
  st_transform(27700) %>%
  st_buffer(dist = 500) %>%
  st_transform(4326)

# extract buffer coordinates
coords <- get_coords(buffer)

# select a range of months
periods <- format(seq(as.Date("2017-07-01"), length = 3, by = "months"), "%Y-%m")

# run the get_crimes() function
results <- get_crimes(coords, periods)

# plot the results for accuracy
leaflet() %>% 
  addProviderTiles(providers$CartoDB.Positron) %>% 
  addPolygons(data = buffer,
              fillColor = "transparent", 
              color = "#212121", weight = 3, dashArray = "5") %>% 
  addCircleMarkers(data = results, 
                   ~long, ~lat, 
                   color = "#fc6721", stroke = FALSE, fillOpacity = 0.5, 
                   radius = 7)

# sort categories of crime / ASB by descending frequency
results %>%
  group_by(category) %>%
  summarise(n = n()) %>%
  ungroup() %>%
  arrange(desc(n)) 

# identify the top 10 repeat locations for Violence and sexual offences
rpt_locs <- results %>%
  filter(category == "Violence and sexual offences") %>% 
  group_by(long, lat, location) %>%
  summarise(n = n()) %>%
  ungroup() %>%
  arrange(desc(n)) %>% 
  slice(1:10)

# plot 
leaflet() %>% 
  addProviderTiles(providers$CartoDB.Positron) %>% 
  addPolygons(data = buffer,
              fillColor = "transparent", 
              color = "#212121", weight = 3, dashArray = "5") %>% 
  addCircleMarkers(data = rpt_locs, ~long, ~lat, 
                   color = "#fc6721", stroke = FALSE, fillOpacity = 0.7, 
                   radius = ~sqrt(n) * 5,
                   label = ~as.character(n), 
                   labelOptions = labelOptions(noHide = T, textOnly = FALSE,
                                               style=list(
                                                 'color'='#212121',
                                                 'font-family'= 'sans-serif',
                                                 'font-size' = '12px',
                                                 'border-color' = 'rgba(117,117,117,1)'
                                               )))
