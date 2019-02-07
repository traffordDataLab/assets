# Function for querying digital vector boundaries from ONS' Open Geography Portal API#

# Open Geography Portal: http://geoportal.statistics.gov.uk/
# API parameters: https://developers.arcgis.com/rest/services-reference/query-feature-service-layer-.htm

# get_vector(boundary, resolution, condition)

get_vector <- function(boundary, condition, resolution = 0){
  require("httr") ; require("sf") 
  
  endpoint <- "https://ons-inspire.esriuk.com/arcgis/rest/services/"
  boundary = boundary
  resolution = resolution
  layer <- paste0("/FeatureServer/", resolution, "/query?")
  base_url <- paste0(endpoint, boundary, layer)
  
  request <- modify_url(
    base_url,
    query = list(
      where = condition, # WHERE clause
      outSR = "4326", # coordinate reference system
      outFields = "*", # return all attributes
      geometryPrecision = 4, # specify the number of decimal places
      f = "geojson" # return GeoJSON format
    )
  )
  response <- GET(request)
  if(http_error(response)){
    stop("The request failed")}
  else {
    result <- st_read(response$url)
    return(result)
  }
}
