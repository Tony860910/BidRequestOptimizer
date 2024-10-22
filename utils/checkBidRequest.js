function checkBidRequest(bidRequest) {
    const missingFields = [];
    const improvements = [];
    const usefulFields = [];
    const interestingFieldsMissing = [];

    // Mandatory Fields Check
    const mandatoryFields = {
        'id': { type: 'string', description: 'Unique ID for the bid request; used for tracking and identification.' },
        'imp': { type: 'array', description: 'Array of at least one impression object.' },
        'device': { type: 'object', description: 'Device information object; provides context about the user’s device for targeting and compliance.' },
        'user': { type: 'object', description: 'User information object; used for audience targeting and user-level bidding optimizations.' },
    };

    // Define recommended fields for OpenRTB 2.5 bid request, including GDPR and consent string
    const recommendedFields = {
        'regs': { type: 'object', description: 'Indicates if the request is subject to GDPR, CCPA, or other regulations.' },
        'regs.ext.gdpr': { type: 'integer', description: 'Flag indicating if GDPR is applicable (1 if applicable).' },
        'user.ext.consent': { type: 'string', description: 'User consent string for GDPR compliance.' },
        'cur': { type: 'array', description: 'List of accepted currencies; allows bidders to know the acceptable currencies for bids.' },
        'device.os': { type: 'string', description: 'Operating system of the device; helps in targeting ads.' },
        'device.ua': { type: 'string', description: 'User agent for browser or app environment targeting.' },
        'device.geo.lat': { type: 'number', description: 'Latitude for geo-targeted advertising.' },
        'device.geo.lon': { type: 'number', description: 'Longitude for geo-targeted advertising.' },
        'device.geo.country': { type: 'string', description: 'Country code (ISO 3166-1 alpha-3) for targeting.' },
        'device.ip': { type: 'string', description: 'IP address for geo-targeting and fraud prevention.' },
        'device.devicetype': { type: 'integer', description: 'Device type for bid adjustments.' },
        'user.id': { type: 'string', description: 'Unique user ID for frequency capping and matching.' },
        'user.buyeruid': { type: 'string', description: 'Buyer’s user ID for recognizing their users.' },
        'imp.bidfloor': { type: 'float', description: 'Minimum bid floor to ensure a base level of revenue.' },
        'imp.secure': { type: 'integer', description: 'Secure flag for HTTPS in-app environments.' },
    };

    // Define "Interesting to Have" fields
    const interestingFields = {
        'tmax': { type: 'integer', description: 'Maximum time allowed for bids.' },
        'device.language': { type: 'string', description: 'Browser language for targeted ads.' },
        'device.geo.utcoffset': { type: 'integer', description: 'UTC offset of the user’s location.' },
        'device.geo.type': { type: 'integer', description: 'Source of location data for accuracy.' },
        'device.geo.region': { type: 'string', description: 'Region code for regional targeting.' },
        'device.geo.city': { type: 'string', description: 'City name for localized campaigns.' },
        'device.geo.zip': { type: 'string', description: 'ZIP code for hyper-local targeting.' },
        'device.dnt': { type: 'integer', description: 'Do Not Track flag for privacy compliance.' },
        'device.osv': { type: 'string', description: 'Operating system version for compatibility.' },
        'user.yob': { type: 'integer', description: 'Year of birth for age-based targeting.' },
        'user.gender': { type: 'string', description: 'Gender for gender-specific targeting.' },
    };

    // Helper function to check if a field is present in the bid request
    function isFieldPresent(fieldPath, obj) {
        const fields = fieldPath.split('.');
        let value = obj;
        for (const field of fields) {
            if (!value || !(field in value)) {
                return false;
            }
            value = value[field];
        }
        return true;
    }

    // Helper function to check if a request originates from the EU based on ISO3 country code
    function isEURequest(bidRequest) {
        const euCountriesISO3 = ['AUT', 'BEL', 'BGR', 'CYP', 'CZE', 'DEU', 'DNK', 'ESP', 'EST', 'FIN', 'FRA', 'GRC', 'HRV', 'HUN', 'IRL', 'ITA', 'LTU', 'LUX', 'LVA', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'SWE'];
        return isFieldPresent('device.geo.country', bidRequest) && euCountriesISO3.includes(bidRequest.device.geo.country);
    }

    // Check mandatory fields
    for (const [fieldPath, { type, description }] of Object.entries(mandatoryFields)) {
        if (!isFieldPresent(fieldPath, bidRequest)) {
            missingFields.push({ name: fieldPath, type, description });
        }
    }

    // Check if 'imp' is a valid array and handle missing fields inside each 'imp' object
    if (Array.isArray(bidRequest.imp)) {
        bidRequest.imp.forEach((imp, index) => {
            // Check for missing fields in each 'imp'
            for (const [fieldPath, { type, description }] of Object.entries(recommendedFields)) {
                if (fieldPath.startsWith('imp') && !isFieldPresent(fieldPath.split('.').slice(1).join('.'), imp)) {
                    usefulFields.push({ name: `imp[${index}].${fieldPath.split('.').slice(1).join('.')}`, type, description });
                }
            }

            for (const [fieldPath, { type, description }] of Object.entries(interestingFields)) {
                if (fieldPath.startsWith('imp') && !isFieldPresent(fieldPath.split('.').slice(1).join('.'), imp)) {
                    interestingFieldsMissing.push({ name: `imp[${index}].${fieldPath.split('.').slice(1).join('.')}`, type, description });
                }
            }
        });
    }

    // Check recommended fields outside of 'imp'
    for (const [fieldPath, { type, description }] of Object.entries(recommendedFields)) {
        if (!fieldPath.startsWith('imp') && !isFieldPresent(fieldPath, bidRequest)) {
            usefulFields.push({ name: fieldPath, type, description });
        }
    }

    // Check interesting fields outside of 'imp'
    for (const [fieldPath, { type, description }] of Object.entries(interestingFields)) {
        if (!fieldPath.startsWith('imp') && !isFieldPresent(fieldPath, bidRequest)) {
            interestingFieldsMissing.push({ name: fieldPath, type, description });
        }
    }

    // GDPR and Consent String Check if in EU
    if (isEURequest(bidRequest)) {
        if (!isFieldPresent('regs.ext.gdpr', bidRequest)) {
            missingFields.push({
                name: 'regs.ext.gdpr',
                type: 'integer',
                description: 'Flag indicating if GDPR is applicable (1 if applicable).'
            });
        } else if (bidRequest.regs.ext.gdpr !== 1) {
            improvements.push({
                name: 'regs.ext.gdpr',
                type: 'integer',
                description: 'GDPR should be set to 1 if the request is subject to GDPR.'
            });
        }

        if (!isFieldPresent('user.ext.consent', bidRequest)) {
            missingFields.push({
                name: 'user.ext.consent',
                type: 'string',
                description: 'User consent string for GDPR compliance.'
            });
        }
    }

    return { missingFields, improvements, usefulFields, interestingFieldsMissing };
}

module.exports = { checkBidRequest };
