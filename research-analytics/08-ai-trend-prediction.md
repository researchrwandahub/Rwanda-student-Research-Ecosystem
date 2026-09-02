# AI Trend Prediction

Goal

Use lightweight AI methods to forecast research trends and detect emerging topics in RSJH content.

Approach

- Extract keyword time series from article metadata (per month/year)
- Use simple time-series forecasting (ARIMA or Prophet) on top keywords
- Use TF-IDF + clustering to detect new topic clusters and flag rapid growth

Deliverables

- Predicted top-10 keywords for the next 12 months
- Alerts for topics with rapid upward trend
- Dashboard widgets showing predicted vs. historical counts

Notes

This is an optional advanced feature; start with simple TF-IDF and linear trend projection before integrating heavier models.