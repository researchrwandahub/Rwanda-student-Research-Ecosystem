# Research Trends in Rwanda

Overview

This doc describes how to analyze research trends over time for RSJH. It covers topic modeling, yearly publication trends, and emerging areas of study.

Approach

1. Extract article metadata (title, abstract, keywords, category, year, authors).
2. Normalize keywords and categories (lowercase, unify synonyms).
3. Use simple counts and TF-IDF to find emerging keywords.
4. Optionally run a lightweight topic model (LDA) on abstracts to categorize research clusters.

Key charts

- Yearly publication count (total and by category)
- Top keywords per year (word cloud or ranked list)
- Topic cluster map showing major research areas and how they evolve

Data needs

- Article timestamps (createdAt)
- Full-text abstracts
- Keywords and categories

Deliverable

A dashboard page showing trend charts with exportable CSVs for each chart.