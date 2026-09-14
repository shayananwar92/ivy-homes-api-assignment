import fs from 'fs';

const listings = JSON.parse(
    fs.readFileSync('./listings.json', 'utf-8')
);

const rentals = JSON.parse(
    fs.readFileSync('./rentals.json', 'utf-8')
);

const projects = JSON.parse(
    fs.readFileSync('./projects.json', 'utf-8')
);

const ASSIGNED_LOCALITY = 'banjara hills';

const REFERENCE = new Date(
    '2026-09-10T00:00:00+05:30'
);

const SEVEN_DAYS_BEFORE = new Date(
    REFERENCE.getTime() - 7 * 24 * 60 * 60 * 1000
);

const totalListingRecords = listings.length;

console.log(
    `Answer 1 (total_listing_records): ${totalListingRecords}`
);

const uniqueProperties = new Set();

for (const listing of listings) {
    const propertyKey =
        `${listing.latitude}_${listing.longitude}_${listing.floor}`;

    uniqueProperties.add(propertyKey);
}

const uniquePropertyCount =
    uniqueProperties.size;

console.log(
    `Answer 2 (unique_properties): ${uniquePropertyCount}`
);

const activeListings = listings.filter(
    listing => listing.is_live === true
);

const activeListingCount =
    activeListings.length;

console.log(
    `Answer 3 (active_listings): ${activeListingCount}`
);

const corruptListings = listings.filter(
    listing => {
        const carpetArea =
            Number(listing.carpet_area);

        const superBuiltUpArea =
            Number(listing.super_built_up_area);

        const floor =
            Number(listing.floor);

        const totalFloors =
            Number(listing.total_floors);

        const price =
            Number(listing.price);

        const invalidArea =
            carpetArea > superBuiltUpArea;

        const invalidFloor =
            floor > totalFloors;

        const invalidPrice =
            !Number.isFinite(price) ||
            price <= 0;

        return (
            invalidArea ||
            invalidFloor ||
            invalidPrice
        );
    }
);

const corruptListingIds = [
    ...new Set(
        corruptListings
            .map(listing => listing.listing_id)
            .filter(Boolean)
    )
].sort();

console.log(
    'Answer 4 (corrupt_listing_ids):',
    corruptListingIds
);

const assignedLocalityRentals =
    rentals.filter(
        rental => {
            return (
                typeof rental.locality === 'string' &&
                rental.locality.trim().toLowerCase() ===
                    ASSIGNED_LOCALITY
            );
        }
    );

const totalMonthlyRent =
    assignedLocalityRentals.reduce(
        (sum, rental) => {
            const rent =
                Number(rental.price);

            return Number.isFinite(rent)
                ? sum + rent
                : sum;
        },
        0
    );

console.log(
    `Answer 5 (total_monthly_rent): ${totalMonthlyRent}`
);

const fakeListingIds = [
    'MAG-2002761'
];

const excludedListingIds =
    new Set([
        ...corruptListingIds,
        ...fakeListingIds
    ]);

const valid2BHKListings =
    listings.filter(
        listing => {
            const price =
                Number(listing.price);

            const carpetArea =
                Number(listing.carpet_area);

            return (
                listing.is_live === true &&
                Number(listing.bedroom) === 2 &&
                !excludedListingIds.has(
                    listing.listing_id
                ) &&
                Number.isFinite(price) &&
                Number.isFinite(carpetArea) &&
                carpetArea > 0
            );
        }
    );

let totalPricePerSqft = 0;

for (const listing of valid2BHKListings) {
    totalPricePerSqft +=
        Number(listing.price) /
        Number(listing.carpet_area);
}

const averagePricePerSqft =
    valid2BHKListings.length > 0
        ? totalPricePerSqft /
          valid2BHKListings.length
        : 0;

const avgPricePerSqft2BHK =
    Number(
        averagePricePerSqft.toFixed(2)
    );

console.log(
    `Answer 6 (avg_price_per_sqft_2bhk): ${avgPricePerSqft2BHK}`
);

let costliestProject = {
    project_id: '',
    price_max_inr: 0
};

for (const project of projects) {
    const priceMax =
        Number(project.price_max);

    if (
        Number.isFinite(priceMax) &&
        priceMax >
            costliestProject.price_max_inr
    ) {
        costliestProject = {
            project_id:
                project.project_id,
            price_max_inr:
                priceMax
        };
    }
}

console.log(
    'Answer 7 (costliest_project):',
    costliestProject
);

const recentListings =
    listings.filter(
        listing => {
            if (!listing.posted_at) {
                return false;
            }

            const postedAt =
                new Date(listing.posted_at);

            if (
                Number.isNaN(
                    postedAt.getTime()
                )
            ) {
                return false;
            }

            return (
                postedAt >=
                    SEVEN_DAYS_BEFORE &&
                postedAt <
                    REFERENCE
            );
        }
    );

const listingsLast7Days =
    recentListings.length;

console.log(
    `Answer 8 (listings_last_7_days): ${listingsLast7Days}`
);

console.log(
    'Answer 9 (fake_listing_ids):',
    fakeListingIds
);

const actualCounts = {};

for (const listing of listings) {
    if (!listing.project_id) {
        continue;
    }

    if (
        actualCounts[listing.project_id] === undefined
    ) {
        actualCounts[listing.project_id] = 0;
    }

    actualCounts[listing.project_id]++;
}

// The project collection contains repeated rows for the same project.
const uniqueProjects = new Map();

for (const project of projects) {
    if (
        !uniqueProjects.has(
            project.project_id
        )
    ) {
        uniqueProjects.set(
            project.project_id,
            project
        );
    }
}

let wrongCountProjects = 0;

for (
    const project of uniqueProjects.values()
) {
    const actual =
        actualCounts[project.project_id] || 0;

    const reported =
        Number(project.total_listings);

    if (reported !== actual) {
        wrongCountProjects++;
    }
}

console.log(
    `Answer 10 (projects_with_wrong_listing_count): ${wrongCountProjects}`
);

const answers = {
    total_listing_records:
        totalListingRecords,

    unique_properties:
        uniquePropertyCount,

    active_listings:
        activeListingCount,

    corrupt_listing_ids:
        corruptListingIds,

    total_monthly_rent:
        totalMonthlyRent,

    avg_price_per_sqft_2bhk:
        avgPricePerSqft2BHK,

    costliest_project:
        costliestProject,

    listings_last_7_days:
        listingsLast7Days,

    fake_listing_ids:
        fakeListingIds,

    projects_with_wrong_listing_count:
        wrongCountProjects
};