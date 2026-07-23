# Call List — Zoho CRM Data Table

Filterable data table interface for Zoho CRM records, built during my role as
a Junior Zoho Developer at Salt & Lime (2024). Published here with
permission; client data and credentials removed.

## The problem

Reviewing and narrowing down CRM records through the standard interface is
slow when you need to scan across many entries at once. This provides a
single table view with filtering, so records can be sorted and narrowed
without stepping through the CRM one record at a time.

## Approach

- Retrieves CRM records through Zoho's REST API using asynchronous calls,
  rendering results dynamically into a table without a page reload.
- Filtering applied over the retrieved set so narrowing results stays
  responsive.
- Built in vanilla JavaScript, HTML, and CSS to run as a Zoho widget within
  the CRM environment.

## Stack

JavaScript · HTML/CSS · Zoho CRM REST API

## Note on this repository

Redacted copy of production work, shared with my employer's permission.
Credentials and client data have been removed.
