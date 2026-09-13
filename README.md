# Ivy Homes API Investigation

A React frontend built against the Ivy Homes Property API, together with an investigation of discrepancies between the supplied API documentation and the running service.

## Running the Project

### Frontend

    cd frontEnd/ivy_homes
    npm install
    npm run dev

Create a `.env` file inside `frontEnd/ivy_homes`:

    VITE_IVY_API_KEY=your_api_key_here

The real API key is excluded from version control.

### Backend Analysis

    cd backEnd
    npm install
    npm run analyze

`fetchData.js` retrieves the collection data used during the investigation.

`analyze.js` calculates the answers to the ten assignment questions.

## Frontend Features

The application provides:

- Real authentication using the live API
- Persistent login state across page refreshes
- Live property listings
- Locality, bedroom, price and furnishing filters
- Paginated property browsing
- Listing detail pages
- Rental listings
- Builder projects
- Market insights

The frontend uses live API data for the application rather than relying on the downloaded analysis JSON files.

## Investigation Methodology

The supplied API reference explicitly states that it may contain incorrect information and that the running API is the source of truth.

I therefore tested the documented authentication and collection behaviour against the live service before relying on it.

The authentication investigation found several discrepancies. The live service requires the API key in the `X-API-Key` header rather than as a query parameter. The login payload uses `access_token` rather than `token`. The access token expires after 900 seconds rather than the documented 86400 seconds, and the live login response includes a refresh token and refresh endpoint despite the documentation stating that no refresh flow exists.

I then paged through the complete listing collection without filters. This returned 4100 records.

Comparing listing IDs and physical-property characteristics showed that these records collapse to 50 unique properties. The listing collection is therefore padded with repeated records despite the documentation stating that listings are unique.

The documentation also states that inactive, expired and withdrawn listings are excluded server side. Counting `is_live` showed 3444 active records out of the 4100 retrievable records.

## Corrupt Listing Investigation

I first tested physical consistency rules:

- carpet area greater than super built-up area
- floor greater than total floors

These checks did not produce a corrupt listing.

I then used the fact that the API key is scoped to Hyderabad and applied a geographic validation. This isolated `MAG-2002456`, whose coordinates fall outside the plausible Hyderabad bounds.

## Fake Listing Investigation

I initially considered unusually small carpet area relative to bedroom count as a possible fake-listing signal.

That hypothesis did not hold by itself. Several suspicious-looking listings had low area-per-BHK values, including verified listings. This made low area insufficient as a standalone fraud characteristic.

I then compared the suspicious candidates against the verified listings. `MAG-2002761` was the strongest outlier because it is unverified and lists a 3 BHK property for ₹13,690.

The final fake-listing conclusion is therefore based on the extreme price outlier rather than low area alone.

## Other Data-Quality Findings

Project price fields contradict the documented integer-INR convention. For example, project `P20027` has a `price_max` value of `96.8`.

Project `total_listings` also does not consistently match the listing records. Comparing project totals against actual listing counts produced 414 projects with incorrect values.

The documented single-listing endpoint `/v1/listing/{listing_id}` returned 404 for a valid listing, so the application currently resolves detail pages from the working listings collection.

The documented analytics endpoint `/v1/analytics/summary` also returned 404. The Insights page therefore calculates useful live-data metrics from the working listings, rentals and projects endpoints.

The documented favourites endpoint `/v1/favourites` returned 404 when tested while authenticated. This is recorded as an API discrepancy rather than replaced with an invented endpoint.

## Answers

| Question | Answer |
|---|---:|
| Total listing records | 4100 |
| Unique properties | 50 |
| Active listing records | 3444 |
| Corrupt listing IDs | MAG-2002456 |
| Total monthly rent | 10295100 |
| Average 2 BHK price/sqft | 16170.34 |
| Costliest project | P20027 |
| Listings in last 7 days | 164 |
| Fake listing IDs | MAG-2002761 |
| Projects with wrong listing count | 414 |

## What Turned Out to Be Fine

The physical area and floor consistency checks did not identify the corrupt listing. This ruled out a tempting but unsupported corruption hypothesis.

Low area per bedroom also turned out not to be a reliable fake-listing signal because verified listings shared the same characteristic.

These failed hypotheses were useful because they prevented the analysis from treating a single suspicious property characteristic as proof of corruption or fraud.

## LLM Disclosure

I used an LLM during development for code drafting, debugging, refactoring and structuring parts of the investigation.

API behaviour and data-quality conclusions were tested against the live service rather than being accepted solely from generated suggestions.