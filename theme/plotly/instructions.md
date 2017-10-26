
Instructions for loading the custom [plotly](https://plot.ly/r/) Trafford Data Lab theme
----------------------------------------------------------------------------------------

**NOTE:** In order for the script to run successfully you will need the following [Google Fonts](https://fonts.google.com/) installed on your system:

-   [Open Sans](https://fonts.google.com/specimen/Open+Sans?selection.family=Open+Sans)
-   [Roboto](https://fonts.google.com/specimen/Roboto?selection.family=Roboto)

------------------------------------------------------------------------

**1. Load the plotly package**

``` r
library(plotly)
```

**2. Provide a source path to the URL containing the custom theme**

``` r
source("https://github.com/traffordDataLab/assets/raw/master/theme/plotly/theme_lab.R")
```

------------------------------------------------------------------------

### An example

``` r
# load the necessary packages
library(plotly) ; library(tidyverse)

source("/Users/henrypartridge/Desktop/OGI/scripts/plotly_theme/plotly_theme_lab.R")

# load some data
df <- data.frame(
  religion = c("Christian", "Buddhist", "Hindu", "Jewish", "Muslim", "Sikh", "Other Religion", "No Religion", "Not Stated"),
  count = c(143639, 768, 2271, 2413, 12994, 1652, 566, 47968, 14307)
)

# prepare the data for plotting
df <- df %>%  
  arrange(count) %>% 
  mutate(religion = factor(religion, levels = religion))

# build your plot
hovertxt <- paste("Residents: ", prettyNum(df$count, big.mark =",", scientific=FALSE))

plot_ly(data = df, x = ~count, y = ~religion, type = "bar", color = '#fc6721',
        hoverinfo = "text", text = hovertxt, height = 400, width = 800) %>% 
  layout(margin = list(l = 70, r = 50, t = 60, b = 100),
         title = FALSE,
         xaxis = list(title = "",
                      showline = FALSE,
                      showgrid = TRUE, gridcolor = '#f0f0f0', gridwidth = 0.3,
                      showticklabels = TRUE,
                      tickfont = axis.text, ticks = F,
                      zeroline = FALSE, 
                      range = c(0, 150000)),
         yaxis = list(title = "",
                      showline = FALSE,
                      showgrid = FALSE,
                      showticklabels = TRUE,
                      titlefont = axis.title,
                      tickfont = axis.text,
                      ticks = F,
                      zeroline = FALSE),
         legend = list(font = legend.text, orientation = "h", xanchor = "center", x = 0.5),
         annotations = list(
           # title
           list(text = "A fifth of Trafford's residents have no religion",
                font = plot.title,
                showarrow = F, 
                xref = "paper", x = 0, xanchor = "left",
                yref = "paper", y = 1.2, yanchor = "right"),
           # subtitle
           list(text = "Religious affiliation, 2011",
                font = plot.subtitle,
                showarrow = F, 
                xref = "paper", x = 0, xanchor = "left",
                yref = "paper", y = 1.1, yanchor = "right"),
           # x-axis title
           list(text = "",
                font = axis.title,
                showarrow = F, textangle = 270,
                xref = 'paper', x = -0.05, xanchor = 'right',
                yref = 'paper', y = 0.9, yanchor = 'bottom'),
           # y-axis title
           list(text = "Residents",
                font = axis.title,
                showarrow = F, 
                xref = 'paper', x = 0.9, xanchor = 'left',
                yref = 'paper', y = -0.05, yanchor = 'top'),
           # caption
           list(text = 'Source: Table KS209EW, Census 2011  |  @traffordDataLab',
                font = plot.subtitle,
                showarrow = FALSE,
                xref = 'paper', x = 1,
                yref = 'paper', y = -0.3)))
```

<br />
