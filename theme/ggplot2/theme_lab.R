theme_lab <- function () { 
  theme_grey(base_size = 11.5, base_family = "Roboto") %+replace% 
    theme(
      # add padding to the plot
      plot.margin = unit(rep(0.5, 4), "cm"),
      # remove the plot background and border
      plot.background = element_blank(),
      panel.background = element_blank(),
      panel.border = element_blank(),
      # make the legend and strip background transparent
      legend.background = element_rect(fill = "transparent", colour = NA),
      legend.key = element_rect(fill = "transparent", colour = NA),
      strip.background = element_rect(fill = "transparent", colour = NA),
      # add light, dotted major grid lines only
      panel.grid.major = element_line(linetype = "dotted", colour = "#757575", size = 0.3),
      panel.grid.minor = element_blank(),
      # remove the axis tick marks and hide axis lines
      axis.ticks = element_blank(),
      axis.line = element_line(color = "#FFFFFF", size = 0.3),
      # modify the bottom margins of the title and subtitle
      plot.title = element_text(size = 18, colour = "#757575", hjust = 0, margin = margin(b = 4)),
      plot.subtitle = element_text(size = 12, colour = "#757575", hjust = 0, margin = margin(b = 10)),
      # add padding to the caption
      plot.caption = element_text(size = 10, colour = "#212121", hjust = 1, margin = margin(t = 15)),
      # change to Open Sans for axes titles, tick labels, legend title and legend key, and strip text
      axis.title = element_text(family = "Open Sans", size = 11, colour = "#757575", face = "plain", hjust = 1),
      axis.text = element_text(family = "Open Sans", size = 10, colour = "#757575", face = "plain"),
      legend.title = element_text(size = 12, colour = "#757575"),
      legend.text = element_text(size = 10, colour = "#757575"),
      strip.text = element_text(family = "Open Sans", size = 12, colour = "#757575", face = "plain")
    )
}
