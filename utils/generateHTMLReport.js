const JsonManipulator = require('./JsonManipulator');

/**
 * Helper function to add missing fields to the bidRequest
 * @param {Object} bidRequest - The original bid request JSON object
 * @param {Array} missingFields - Array of mandatory fields to add
 * @param {Array} usefulFields - Array of recommended fields to add
 * @param {Array} interestingFieldsMissing - Array of interesting fields to add
 * @returns {Object} - The updated bid request object
 */
function addMissingFields(bidRequest, missingFields, usefulFields, interestingFieldsMissing) {
    const manipulator = new JsonManipulator(bidRequest);
    const addedFields = [];  // Store paths of added fields

    const allFields = [
        ...missingFields.map(field => ({ ...field, type: 'required' })),
        ...usefulFields.map(field => ({ ...field, type: 'recommended' })),
        ...interestingFieldsMissing.map(field => ({ ...field, type: 'interesting' }))
    ];

    allFields.forEach(field => {
        const fieldPath = field.name;
        if (!manipulator.has(fieldPath)) {
            let defaultValueWithMarker;
            // Differentiate the type of field by adding a marker to the value
            if (field.type === 'required') {
                defaultValueWithMarker = `This field (${fieldPath}) is __required__`;
            } else if (field.type === 'recommended') {
                defaultValueWithMarker = `This field (${fieldPath}) is __recommended__`;
            } else if (field.type === 'interesting') {
                defaultValueWithMarker = `This field (${fieldPath}) is __interesting__`;
            }

            manipulator.setValue(fieldPath, defaultValueWithMarker);  // Add the field with the respective marker
            addedFields.push(fieldPath);  // Track the newly added field
        }
    });

    return { updatedBidRequest: manipulator.get(), addedFields };
}

/**
 * Calculate the grade based on missing fields
 * @param {Array} missingFields - Array of missing mandatory fields
 * @param {Array} usefulFields - Array of missing recommended fields
 * @param {Array} interestingFields - Array of missing interesting fields
 * @returns {String} - Grade from A+ to F
 */
function calculateGrade(missingFields, usefulFields, interestingFields) {
    if (missingFields.length > 0) {
        // If any mandatory field is missing, the grade is F without question
        return 'F';
    }

    const totalUseful = usefulFields.length;
    const totalInteresting = interestingFields.length;

    // Perfect score, no fields missing
    if (totalUseful === 0 && totalInteresting === 0) {
        return 'A+';
    }
    
    // A minor penalty for missing interesting fields, but no missing useful fields
    if (totalUseful === 0 && totalInteresting > 0) {
        return 'A'; // No useful fields missing, but some interesting fields are
    }

    // Allow up to 1 missing useful field for a B
    if (totalUseful > 0 && totalUseful <= 1) {
        return 'B'; // Up to 1 useful field missing
    }

    // Allow up to 3 missing useful fields for a C
    if (totalUseful > 1 && totalUseful <= 3) {
        return 'C'; // Missing 2-3 useful fields
    }

    // Allow up to 5 missing useful fields for a D
    if (totalUseful > 3 && totalUseful <= 5) {
        return 'D'; // Missing 4-5 useful fields
    }

    // More than 5 missing useful fields results in an F
    return 'F'; // More than 5 useful fields missing is too much
}

/**
 * Generate an HTML report for the bid request with grading
 * @param {Array} missingFields - Array of mandatory fields
 * @param {Array} improvements - Array of improvements (unused in original code)
 * @param {Array} usefulFields - Array of recommended fields
 * @param {Array} interestingFieldsMissing - Array of interesting fields
 * @param {Object} bidRequest - The original bid request JSON object
 * @returns {String} - HTML report as a string
 */
function generateHTMLReport(missingFields, improvements, usefulFields, interestingFieldsMissing, bidRequest) {
    // First, add missing fields to the bidRequest
    const { updatedBidRequest, addedFields } = addMissingFields(bidRequest, missingFields, usefulFields, interestingFieldsMissing);

    // Calculate grade
    const grade = calculateGrade(missingFields, usefulFields, interestingFieldsMissing);

    // Stringify the updated bid request for display
    const prettyOptimizedJSON = JSON.stringify(updatedBidRequest, null, 4); // Pretty print JSON

    // Define grade color based on the result
    let gradeColor;
    switch (grade) {
        case 'A+':
            gradeColor = '#4CAF50'; // Green for A+
            break;
        case 'A':
            gradeColor = '#8BC34A'; // Light green for A
            break;
        case 'B':
            gradeColor = '#CDDC39'; // Yellow-green for B
            break;
        case 'C':
            gradeColor = '#FFC107'; // Amber for C
            break;
        case 'D':
            gradeColor = '#FF5722'; // Orange for D
            break;
        case 'F':
        default:
            gradeColor = '#D32F2F'; // Dark red for F
            break;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bid Request Check Report</title>
            <style>
            
                 .report-table {
                    margin-right:25px;
                    width: 40%;
                 }

                .required-field {
                    background-color: #E57373; /* Red background for required fields */
                    color: white;
                    padding: 2px 4px;
                    border-radius: 4px;
                }

                .recommended-field {
                    background-color: #81C784; /* Green background for recommended fields */
                    color: white;
                    padding: 2px 4px;
                    border-radius: 4px;
                }

                .interesting-field {
                    background-color: #64B5F6; /* Blue background for interesting fields */
                    color: white;
                    padding: 2px 4px;
                    border-radius: 4px;
                }
                
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }

                header {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-size: 24px;
                }

                footer {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 10px;
                    font-size: 12px;
                    position: fixed;
                    width: 100%;
                    bottom: 0;
                }

                .content {
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                }

                h2 {
                    color: #555;
                    font-size: 18px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }

                th, td {
                    padding: 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }

                th {
                    background-color: #f2f2f2;
                }

                .json-container {
                    background-color: #f4f4f4;
                    border-left: 1px solid #ddd;
                    padding: 10px;
                    font-family: 'Courier New', Courier, monospace;
                    white-space: pre-wrap;
                    overflow: auto;
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
                    position: relative;
                }
                
                .bid-request-container {
                    position: relative;
                    width: 55%;
                }

                .copy-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 5px 10px;
                    background-color: #333;
                    color: white;
                    border: none;
                    cursor: pointer;
                    border-radius: 5px;
                }

                .copy-button:hover {
                    background-color: #555;
                }

                .grade {
                    color: white;
                    font-size: 30px;
                    padding: 10px 20px;
                    border-radius: 10px;
                    background-color: ${gradeColor};
                    text-align: center;
                    margin-bottom: 20px;
                }
                .content-grade {
                    padding: 20px;
                }
                .mandatory th {
                     background-color: #E57373;
                     color: white;
                }
                .recommended th {
                    background-color: #81C784;
                    color: white;
                }  
                .interesting th {
                    background-color: #6a76bf;
                    color: white;
                } 
                
            </style>
        </head>
        <body>
            <header>Bid request check report</header>
            <div class="content-grade">
                <h2>Grade: <span class="grade">${grade}</span></h2>
             </div>

            <div class="content">

                <div class="report-table">

                    <h2>Mandatory Fields that are Missing</h2>
                    <table>
                        <thead class="mandatory">
                            <tr>
                                <th>Attribute</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${missingFields.length > 0
                                ? missingFields.map(field => `<tr><td>${field.name.replace('[0]', '[]')}</td><td>${field.type}</td><td>${field.description}</td></tr>`).join('')
                                : '<tr><td colspan="3">None</td></tr>'}
                        </tbody>
                    </table>

                    <h2>Recommended Fields We Think You Should Include</h2>
                    <table>
                        <thead class="recommended">
                            <tr>
                                <th>Attribute</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usefulFields.length > 0
                                ? usefulFields.map(field => `<tr><td>${field.name.replace('[0]', '[]')}</td><td>${field.type}</td><td>${field.description}</td></tr>`).join('')
                                : '<tr><td colspan="3">All recommended fields are present.</td></tr>'}
                        </tbody>
                    </table>

                    <h2>Interesting Fields That Would be Helpful</h2>
                    <table>
                        <thead class="interesting">
                            <tr>
                                <th>Attribute</th>
                                <th>Type</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${interestingFieldsMissing.length > 0
                                ? interestingFieldsMissing.map(field => `<tr><td>${field.name.replace('[0]', '[]')}</td><td>${field.type}</td><td>${field.description}</td></tr>`).join('')
                                : '<tr><td colspan="3">All interesting fields are present.</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="bid-request-container">
                    <h2>Optimized Bid Request</h2>
                    <div class="json-container">
                        <button class="copy-button" onclick="copyToClipboard()">Click to Copy</button>
                        <span class="copy-feedback" id="copyFeedback">Copied!</span>
                        <pre id="optimizedJson">${prettyOptimizedJSON}</pre>
                    </div>
                </div>

            </div>

            <footer>Created by Anthony Da Cunha</footer>

   <script>
    function copyToClipboard() {
        const jsonText = document.getElementById('optimizedJson').innerText;
        const textarea = document.createElement('textarea');
        textarea.value = jsonText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        // Show feedback message after copying
        const feedback = document.getElementById('copyFeedback');
        feedback.style.display = 'inline'; // Show the "Copied!" message
        setTimeout(() => {
            feedback.style.display = 'none'; // Hide it after 2 seconds
        }, 2000);
    }

    function highlightAddedFields() {
        const jsonContainer = document.getElementById('optimizedJson');
        let jsonText = jsonContainer.innerHTML;

        // Replace markers with styled spans
        jsonText = jsonText.replace(/__required__/g, '<span class="required-field">required</span>');
        jsonText = jsonText.replace(/__recommended__/g, '<span class="recommended-field">recommended</span>');
        jsonText = jsonText.replace(/__interesting__/g, '<span class="interesting-field">interesting to have</span>');

        // Update the container with the highlighted text
        jsonContainer.innerHTML = jsonText;
    }

    // Call the function after the page has loaded
    document.addEventListener('DOMContentLoaded', () => {
        highlightAddedFields();
        // Initially hide the "Copied!" message
        const feedback = document.getElementById('copyFeedback');
        feedback.style.display = 'none';  // Ensure the feedback is hidden on page load
    });
</script>


        </body>
        </html>
    `;
}

module.exports = { generateHTMLReport };
