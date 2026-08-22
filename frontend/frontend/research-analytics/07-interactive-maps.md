# Interactive Maps

Objective

Show geographic distributions of research, author affiliations, and public health signals across Rwanda.

Features

- Map of universities and number of publications per location
- Choropleth of research topics by district (requires location tag in metadata)
- Clickable markers to view university profile and publications

Implementation

- Use Leaflet.js or Mapbox GL JS for interactive maps
- Prepare GeoJSON with university/district coordinates
- Connect map interactions to article lists and analytics charts

Privacy

Ensure no sensitive patient location data is exposed. Aggregate to district-level where possible.