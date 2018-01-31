## The following functions are designed to allow users to extract crime data for polygons from the data.police.uk API ##

# get_coords() -------
# Extract coordinates from a polygon in the format required by the data.police.uk API

get_coords <- function(x) {
  require("sf"); require("dplyr") ; require("stringr")
  
  # retrieve coordinates in a data.frame
  coords_df <- st_coordinates(x) %>%
    as_tibble() %>%
    select(lng = X, lat = Y) %>%
    mutate(lng = sprintf("%0.5f", lng),
           lat = sprintf("%0.5f", lat)) %>% 
    mutate(lng = sub("$", ":", lng),
           lat = sub("$", ",", lat)) 
  
  # convert to a vector
  out <- as.vector(t(coords_df)) %>% 
    paste(collapse = "") %>% 
    str_sub(., 1, str_length(.)-1)

  return(out)
}

# get_crimes() -------
# Query crime data for a polygon from data.police.uk API

get_crimes <- function(coords, periods) {
  require("httr") ; require("jsonlite") ; require("dplyr")
  
  # Loop through the months
  for (n_periods in 1:length(periods)) {
    
    # Construct the API request
    request <- POST(url = "https://data.police.uk/api/crimes-street/all-crime",
                    query = list(poly = coords, 
                                 date = periods[n_periods]))
    
    # Process the API request content
    content <- content(request, as = "text", encoding = "UTF-8")
    
    # Parse the JSON response
    results <- fromJSON(txt = content) 
    
    # Return crime categories from API
    categories <- GET("https://data.police.uk/api/crime-categories")
    categories <- fromJSON(content(categories, as = "text", encoding = "UTF-8"))
    
    # Tidy results
    results_df <- data.frame(
      month = results$month,
      url = results$category,
      location = results$location$street$name,
      long = as.numeric(as.character(results$location$longitude)),
      lat = as.numeric(as.character(results$location$latitude)),
      stringsAsFactors = FALSE
    )
    
    # Rename categories
    df <- left_join(results_df, categories, by = "url") %>% 
      select(category = name, long, lat, location, month)
    
    ## Store data
    if (n_periods == 1) out <- df else out <- bind_rows(out, df)
    
  }
  
  return(out)
  
}


