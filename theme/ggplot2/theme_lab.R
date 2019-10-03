theme_lab <- function () { 
  theme_grey(base_size = 14, base_family = "sans") %+replace% 
    theme(
      # plot margin
      plot.margin = unit(rep(0.5, 4), "cm"),
      # plot background and border
      plot.background = element_blank(),
      panel.background = element_blank(),
      panel.border = element_blank(),
      # grid lines
      panel.grid.major.x = element_blank(),
      panel.grid.major.y = element_line(size = 0.5, color = "#cbcbcb"), 
      panel.grid.minor = element_blank(),
      # axis ticks and lines
      axis.ticks = element_blank(),
      axis.line = element_blank(),
      # title, subtitle and caption
      plot.title = element_text(size = 20, face = "bold", colour = "#757575", hjust = 0),
      plot.subtitle = element_text(size = 16, colour = "#757575", hjust = 0, margin = margin(9, 0, 9, 0)),
      plot.caption = element_text(size = 10, color = "grey50", hjust = 1, margin = margin(t = 15)),
      # axes titles
      axis.title = element_text(colour = "#757575", hjust = 1),
      axis.text.x = element_text(margin = margin(b = 7)),
      axis.text.y = element_text( margin = margin(l = 7)),
      # legend
      legend.position = "top",
      legend.background = element_blank(),
      legend.key = element_blank(),
      legend.title = element_text(size = 12, colour = "#757575"),
      legend.text.align = 0,
      legend.text = element_text(size = 12, colour = "#757575"),
      # facetting
      strip.background = element_rect(fill = "transparent", colour = NA),
      strip.text = element_text(size = 12, face = "bold", colour = "#757575", hjust = 0)
    )
}
