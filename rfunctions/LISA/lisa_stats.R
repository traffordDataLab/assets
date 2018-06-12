## lisa_stats ##

# This function calculates the statistics required to produce a LISA cluster map (Anselin, 1995) using 
# a first order, Queen's contiguity spatial weights matrix.

# load require packages
require(dplyr) ; require(spdep)

lisa_stats <- function(x, variable, queen = FALSE, sig = 0.05){
  if (!inherits(x, "SpatialPolygonsDataFrame")) 
    stop("MUST be a SpatialPolygonsDataFrame object")

# create neighbours list (first order queen contiguity)
neighbours <- poly2nb(x, queen = queen)
# construct row standardised spatial weights matrix
weights <- nb2listw(neighbours, style = "W")
# calculate local Moran's I values
local_moran <- localmoran(x[[variable]], listw = weights, zero.policy = FALSE, na.action = na.exclude)

# create a standardized variable (mean = 0 and sd = 1)
x$s_value <- scale(x[[variable]]) %>% as.vector()
# create a spatially lagged variable
x$lag_s_value <- lag.listw(weights, x$s_value)

# create variable for statistically significant spatial clusters (high-high, low-low) and outliers (high-low, low-high)
x@data <- x@data %>%
  mutate(quad_sig = case_when(
    x$s_value >= 0 & x$lag_s_value >= 0 & local_moran[, 5] <= sig ~ "High-High",
    x$s_value <= 0 & x$lag_s_value <= 0 & local_moran[, 5] <= sig ~ "Low-Low",
    x$s_value <= 0 & x$lag_s_value >= 0 & local_moran[, 5] <= sig ~ "Low-High",
    x$s_value >= 0 & x$lag_s_value <= 0 & local_moran[, 5] <= sig ~ "High-Low",
    local_moran[, 5] > sig ~ "Not significant"
  ))

return(x)

}