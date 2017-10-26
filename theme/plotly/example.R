# load the necessary packages
library(plotly) ; library(tidyverse) ; library(htmlwidgets)

source("https://github.com/traffordDataLab/assets/raw/master/theme/plotly/theme_lab.R")

# load some data
df <- data.frame(
  religion = c("Christian", "Buddhist", "Hindu", "Jewish", "Muslim", "Sikh", "Other Religion", "No Religion", "Not Stated"),
  count = c(143639, 768, 2271, 2413, 12994, 1652, 566, 47968, 14307)
)

# load some data
df <- data.frame(
  religion = c("Christian", "Buddhist", "Hindu", "Jewish", "Muslim", "Sikh", "Other Religion", "No Religion", "Not Stated"),
  count = c(143639, 768, 2271, 2413, 12994, 1652, 566, 47968, 14307)
)

# prepare the data for plotting
df <- df %>%  
  arrange(count) %>% 
  mutate(religion = factor(religion, levels = religion))

# create your plotly plot
hovertxt <- paste("Residents: ", prettyNum(df$count, big.mark =",", scientific=FALSE))

plot <- plot_ly(data = df, x = ~count, y = ~religion, type = "bar", color = '#fc6721',
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
           list(text = "A fifth of Trafford's residents have no religion",
                font = plot.title,
                showarrow = F, 
                xref = "paper", x = 0, xanchor = "left",
                yref = "paper", y = 1.2, yanchor = "right"),
           list(text = "Religious affiliation, 2011",
                font = plot.subtitle,
                showarrow = F, 
                xref = "paper", x = 0, xanchor = "left",
                yref = "paper", y = 1.1, yanchor = "right"),
           list(text = "",
                font = axis.title,
                showarrow = F, textangle = 270,
                xref = 'paper', x = -0.05, xanchor = 'right',
                yref = 'paper', y = 0.9, yanchor = 'bottom'),
           list(text = "Residents",
                font = axis.title,
                showarrow = F, 
                xref = 'paper', x = 0.9, xanchor = 'left',
                yref = 'paper', y = -0.05, yanchor = 'top'),
           list(text = 'Source: Table KS209EW, Census 2011  |  @traffordDataLab',
                font = plot.subtitle,
                showarrow = FALSE,
                xref = 'paper', x = 1,
                yref = 'paper', y = -0.3)))

# save as png (need to install PhantomJS using `webshot::install_phantomjs()`)
export(plot, file='example.png')

# save as html
saveWidget(plot, "example.html")
