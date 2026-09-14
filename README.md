# Ivy Homes — Property Discovery Frontend

A frontend built for the Ivy Homes Software Engineering Internship assignment.

The application provides a property discovery experience over the Ivy Homes API, including authentication, listing search and filtering, property details, saved listings, rentals, projects, and an insights dashboard.

## Live Demo

https://ivy-homes-tawny.vercel.app/

## Repository

https://github.com/shayananwar92/ivy-homes-api-assignment

---

## Tech Stack

- React
- Vite
- React Router
- CSS
- Vercel

The project uses the Ivy Homes API as its backend.

I used LLM assistance during development for debugging, implementation support, and reviewing approaches. I verified the generated changes and tested the resulting application myself.

---

## How to Run

### 1. Clone the repository

    git clone https://github.com/shayananwar92/ivy-homes-api-assignment.git
    cd ivy-homes-api-assignment

### 2. Install dependencies

    npm install

### 3. Configure the API key

Create a `.env` file in the project root:

    VITE_IVY_API_KEY=your_api_key_here

Note: The `.env` file is gitignored and is not included in the repository. Create the `.env` file in `frontEnd/ivy_homes/` and add the provided Ivy Homes API key before running the project..

### 4. Start the development server

    npm run dev

Open the local URL shown by Vite.

### 5. Build for production

    npm run build

---

## Demo Login

The application supports the demo users supplied with the assignment.

Use any of the provided Ivy Homes demo accounts with the supplied password.

---

## Implemented Features

### Authentication

- Login with the supplied demo credentials
- Authenticated API requests
- Session persistence across page refreshes
- Handling of the live API access-token expiry and refresh flow
- Logout

### Listings

- Browse listings
- Incremental loading/pagination
- Search
- Locality filtering
- Bedroom/BHK filtering
- Furnishing filtering
- Property type filtering
- Price-range filtering
- Invalid/non-live records are excluded from the main browsing experience
- Duplicate API records are collapsed using `listing_id`

### Listing Details

Each listing has its own URL and can be opened directly in a new tab.

The documented single-listing endpoint was unavailable on the live API, so the application instead loads the working listings collection, deduplicates it, and locates the requested listing by `listing_id`.

### Saved Listings

- Save and unsave properties
- Per-user saved state
- Saved state survives page refresh
- Saved state survives logout and re-login
- Different users have separate saved-listing collections

The documented favourites endpoint returned `404` on the live API, so the frontend uses browser local storage for this feature instead of relying on the unavailable endpoint.

### Rentals

- Browse rental listings
- Display rental pricing and property information

### Projects

- Browse projects
- Display project information, pricing, area and listing information

### Insights

The application calculates useful insights from the working API collections rather than relying on the documented analytics endpoint, which returned `404` on the live service.

---

# API Investigation

The supplied API reference explicitly says that it was generated from old material and that the running API is the source of truth. I therefore treated every documented behaviour as a hypothesis to test rather than as a guarantee.

My investigation had two parts:

1. Test the documented API behaviour directly.
2. Pull the complete datasets and form/test hypotheses about data-level inconsistencies.

For collection data, I paged through the available records to the end instead of reasoning from a small sample.

---

# Documentation / Endpoint Investigation

## Hypothesis 1: The documented API-key transport is correct

### What I expected

The documentation said the API key should be supplied as the `api_key` query parameter.

### What I did

I tested authenticated requests using the documented request shape and compared them with requests using the API key in the request header.

### What I found

The working authenticated requests required the key in the `X-API-Key` header.

### Result

The documentation was wrong about how the API key is transported.

### What I changed

The frontend sends the API key in the request header.

---

## Hypothesis 2: The login response uses `token`

### What I expected

The documentation showed:

    token

as the access-token field.

### What I did

I inspected the raw JSON returned by `POST /auth/login`.

### What I found

The live response uses:

    access_token

instead of `token`.

### Result

The documented response shape was wrong.

### What I changed

The frontend reads `access_token`.

---

## Hypothesis 3: The access token lasts 24 hours

### What I expected

The documentation stated that tokens remain valid for 86400 seconds.

### What I did

I inspected the live authentication response and tested the behaviour of the issued access token over time.

### What I found

The live access token has a much shorter lifetime of 900 seconds.

### Result

The documented token lifetime was wrong.

### What I changed

The frontend does not assume that one access token will remain valid for the whole session.

---

## Hypothesis 4: There is no token refresh flow

### What I expected

The documentation explicitly said there was no refresh flow.

### What I did

I inspected the live login response and the behaviour after access-token expiry.

### What I found

The live response provides a `refresh_token` and a refresh endpoint, and the expired-token response also points the client toward the refresh flow.

### Result

The documentation was wrong.

### What I changed

The frontend handles token refresh when the access token expires.

---

## Hypothesis 5: The documented single-listing endpoint works

### What I expected

The documentation described:

    /v1/listing/{listing_id}

### What I did

I requested the endpoint using a valid listing ID.

### What I found

The endpoint returned `404`.

### Result

The documented single-listing route is unavailable on the live API.

### What I changed

The detail page loads the working listings collection and finds the requested listing by `listing_id`.

---

## Hypothesis 6: The documented favourites endpoint works

### What I expected

The documentation described:

    GET /v1/favourites

### What I did

I tested the endpoint while authenticated and also observed the request from the application in the browser Network panel.

### What I found

The documented endpoint returned `404`.

### Result

The documented favourites resource is unavailable on the live API.

### What I changed

I implemented saved listings with per-user browser local storage so the required user-facing feature still works.

---

## Hypothesis 7: The documented analytics endpoint works

### What I expected

The documentation described:

    /v1/analytics/summary

### What I did

I requested the documented endpoint and also tested the root-path variant.

### What I found

Both returned `404`.

### Result

The documented analytics resource is unavailable.

### What I changed

The Insights page calculates useful aggregates from the working collections instead.

---

# Dataset Investigation

After checking the documented endpoints, I pulled the listing and project collections completely and started looking for patterns that would only be visible at dataset level.

## Hypothesis 8: Every returned listing is a distinct property

### Why I considered it

The documentation says that `listing_id` is globally unique and that each listing corresponds to one physical property.

### What I did

I retrieved all listing pages and counted:

- total records
- unique `listing_id` values
- unique property/location combinations

### What I found

There were:

- 4,100 retrievable listing records
- only 50 unique `listing_id` values/properties

The same listings appeared repeatedly.

### Result

The assumption that every returned record is a distinct property was false.

### What I changed

The application deduplicates listings by `listing_id` before displaying them.

This also changed how I interpreted aggregate counts: raw API record count and distinct-property count are not the same thing.

---

## Hypothesis 9: The repeated records might be different versions of the same property

### Why I considered it

Before concluding that the dataset was simply padded with duplicates, I wanted to make sure the repeated IDs were not representing legitimate updates to the same property.

### What I did

I compared repeated records using `listing_id` and a property/location composite based on the listing data.

### What I found

Repeated records represented the same underlying property rather than separate properties with different identities.

### Result

This supported treating them as duplicate copies for analysis/display rather than independent properties.

---

## Hypothesis 10: Every returned listing is active

### Why I considered it

The documentation says inactive, expired and withdrawn listings are excluded server-side.

### What I did

I paged through the entire listing collection and counted records by `is_live`.

### What I found

Out of 4,100 records, only 3,444 had:

    is_live = true

### Result

The documentation was wrong about inactive records being excluded.

### What I changed

The frontend explicitly filters for live listings.

---

## Hypothesis 11: Negative or impossible listing values could identify corrupt records

### Why I considered it

The assignment asks for corrupt listings, so I looked for values that could not represent a real property.

### What I did

I validated listing fields for impossible values rather than only looking for unusual but possible values.

### What I found

`MAG-2002456` has a negative listing price:

    -9990000

A negative sale price cannot represent a valid property listing.

### Result

This was a strong, unambiguous corrupt-record candidate.

### Answer

    MAG-2002456

### What I changed

The record is not treated as a valid property in the frontend.

---

## Hypothesis 12: Very low area-per-BHK values could identify fake listings

### Why I considered it

While inspecting suspicious listings, I noticed some unusually small areas relative to bedroom count.

This suggested a possible rule:

    extremely low area / BHK => fake listing

### What I did

I compared suspicious listings against verified listings instead of using the rule on suspicious records alone.

### What I found

Verified listings also contained unusually low area-per-BHK values.

### Result

The hypothesis did not hold.

Low area-per-BHK alone was not strong enough evidence to classify a listing as fake.

### What I changed

I did not use area-per-BHK alone as the fake-listing rule.

---

## Hypothesis 13: A suspicious listing's verification status alone could identify fake listings

### Why I considered it

Some suspicious candidates were unverified while other listings were verified.

### What I did

I compared multiple unverified and verified records and looked for other distinguishing properties.

### What I found

Being unverified was not enough by itself. There were legitimate-looking unverified listings as well.

### Result

Verification status alone was not sufficient evidence.

### What I changed

I kept it as supporting evidence rather than the deciding factor.

---

## Hypothesis 14: A combination of suspicious price + other signals could identify a fake listing

### Why I considered it

After rejecting area-per-BHK and verification status as standalone rules, I looked for combinations that were much more extreme.

### What I did

I compared suspicious candidates against verified listings and checked price, BHK, area and verification status together.

### What I found

`MAG-2002761` stood out as an extreme outlier: it is an unverified 3 BHK listing with a listed price of ₹13,690, which is dramatically inconsistent with the surrounding property prices.

The area by itself was not enough to make the classification, because verified records also showed low area-per-BHK values.

### Result

This provided substantially stronger evidence than the earlier hypotheses.

### Answer

    MAG-2002761

I intentionally did not classify additional suspicious-looking records as fake without comparable evidence.

---

## Hypothesis 15: Project listing counts should match the actual listings

### Why I considered it

The documentation says that `project.total_listings` is recomputed and always agrees with listings returned for that project.

### What I did

I grouped listing records by `project_id` and compared those counts with `project.total_listings`.

### What I found

The values disagreed across 414 repeated project records, representing 46 distinct projects.

### Result

The documentation's consistency claim was false.

### Answer

    46

### What I changed

The frontend does not treat `project.total_listings` as an authoritative live listing count.

---

## Hypothesis 16: Project prices are integer absolute INR values

### Why I considered it

The documentation explicitly says that `price_min` and `price_max` are in rupees.

### What I did

I inspected project records across the collection rather than checking just one sample.

### What I found

Project price values include decimal values such as:

    P20027 -> price_max = 96.8

This does not match the documented representation of integer absolute rupee values.

### Result

The documented unit/representation is incorrect or incomplete.

### What I changed

I do not blindly format these project values as absolute integer rupees.

---

## Hypothesis 17: The complete listings dataset could be treated directly as 4,100 unique properties

### Why I considered it

The first aggregate obtained from pagination was 4,100.

### What I did

I compared that number against the distinct listing IDs.

### What I found

4,100 is the number of retrievable records, not the number of distinct properties.

There are only 50 unique properties, with repeated copies accounting for the remaining records.

### Result

This hypothesis was rejected.

### What I changed

I kept both concepts separate in the analysis:

    total_listing_records = 4100
    unique_properties = 50

---

## Hypothesis 18: A single unusual property record is enough to establish a dataset-wide rule

### Why I considered it

Some individual records looked suspicious during manual inspection.

### What I did

For each potential finding, I tried to compare it against other records before turning it into a rule.

### What I found

Some unusual values turned out to also exist in otherwise legitimate/verified records.

### Result

Single-record anomalies are not automatically dataset-wide rules.

### What I changed

I only kept findings where the evidence was strong enough to distinguish the actual discrepancy from normal variation.

---

# Checks That Did Not Become Findings

Several hypotheses were investigated but deliberately excluded from the final findings because the evidence was insufficient.

### Low area-per-BHK = fake

Rejected because verified listings also had low area-per-BHK values.

### Unverified = fake

Rejected because verification status by itself did not establish that a listing was fraudulent.

### Unusual property dimensions = corrupt

Rejected as a general rule because unusual dimensions can still occur in valid records. The negative price on `MAG-2002456` was much stronger evidence of corruption.

### One project-count mismatch = all project counts are wrong

I did not make that conclusion from one record. I compared the listing collection against the project collection across the dataset and found 414 mismatches.

### One suspicious listing = evidence of a fake-listing pattern

I did not generalize from one candidate. I compared suspicious candidates against verified records and only retained `MAG-2002761` as the strong fake-listing candidate.

### One repeated listing ID = duplicate-data problem

I did not stop after finding one duplicate. I compared the complete collection and found the much larger 4,100-record / 50-property structure.

---

# Final Dataset Answers

The final answers used in `submission.json` are:

| Question | Answer |
| --- | --- |
| Total listing records | 4100 |
| Unique properties | 50 |
| Active listings | 3444 |
| Corrupt listing IDs | `MAG-2002456` |
| Total monthly rent | 10295100 |
| Average price/sqft for 2BHK | 16170.34 |
| Costliest project | `P20027` |
| Costliest project `price_max` | 96.8 |
| Listings from the last 7 days | 164 |
| Fake listing IDs | `MAG-2002761` |
| Projects with incorrect listing counts | 46 |

The exact machine-readable answers and finding evidence are provided separately in `submission.json`.

---

# Implementation Notes

### Full collection retrieval

Because pagination, duplicate records and aggregate counts matter to the assignment, collection data is fetched page by page rather than relying on a small sample.

### Deduplication

Listings are deduplicated by `listing_id` before they are displayed.

### Data validation

Listings with invalid values such as non-positive prices are excluded from the main browsing experience.

### Detail pages

Because the documented detail endpoint returned `404`, detail pages resolve listings from the working collection.

### Saved listings

Because the documented favourites endpoint returned `404`, saved state is stored under a user-specific local-storage key.

### Insights

Because the documented analytics endpoint returned `404`, insights are calculated from the working collections.

---

# What I Would Do With Another Two Days

With another two days, I would focus on reliability and production quality rather than adding many more screens.

1. Add a backend/proxy layer so the API key is not exposed to the browser.
2. Move saved listings to persistent server-side storage when a working backend endpoint is available.
3. Add automated tests for authentication, token refresh, filtering, deduplication and saved-listing isolation.
4. Add stronger API caching and request deduplication to reduce repeated collection fetches.
5. Improve loading, error and empty states and add more accessibility coverage.
6. Add an automated data-validation/investigation script that can rerun the dataset checks against the live API.

---

## Summary

The main implementation principle was to treat the API documentation as a starting point, not as a source of truth.

I first tested the documented endpoints and request/response shapes. I then retrieved the complete collections and used hypothesis-driven checks to distinguish real inconsistencies from unusual but valid data.

The final submission contains only the findings for which I had enough evidence, while this README records the investigation paths that did not become findings as well.