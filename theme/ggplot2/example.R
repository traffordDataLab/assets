# load the necessary packages
library(ggplot2) ; library(tidyverse) ; library(scales) ; library(svglite)

source("https://trafforddatalab.github.io/assets/theme/ggplot2/theme_lab.R")

theme_set(theme_lab())

# load some data
df <- data.frame(
  religion = c("Christian", "Buddhist", "Hindu", "Jewish", "Muslim", "Sikh", "Other Religion", "No Religion", "Not Stated"),
  count = c(143639, 768, 2271, 2413, 12994, 1652, 566, 47968, 14307)
)

# create a ggplot object
plot <- df %>%  
  arrange(count) %>% 
  mutate(religion = factor(religion, levels = religion)) %>% 
  ggplot(aes(religion, count)) +
  geom_col(fill = "#fc6721", alpha = 0.8, show.legend = FALSE) +
  geom_text(aes(label = comma(count)), colour = "#212121", size = 3.3, hjust = 0, nudge_y = 2000) +
  scale_y_continuous(label = comma, limits=c(0, 170000), expand = c(0,0)) +
  coord_flip() +
  labs(x = NULL, y = "Residents",
       title = "A fifth of Trafford's residents have no religion",
       subtitle = "Religious affiliation, 2011",
       caption = "Source: Table KS209EW, Census 2011  |  @traffordDataLab")

# style with the Trafford Data Lab theme and tweak
plot + theme_lab() +
  theme(panel.grid.major.y = element_blank(),
        axis.text.y = element_text(hjust = 0))

# save as png, svg or pdf
ggsave("example.png", dpi = 300, scale = 1)
ggsave("example.svg", dpi = 300, scale = 1)
ggsave("example.pdf", device = cairo_pdf, scale = 1.2, width = 6, height = 6)