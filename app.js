const fs = require('fs');
const path = require('path');
const { checkBidRequest } = require('./utils/checkBidRequest');
const { generateHTMLReport } = require('./utils/generateHTMLReport');
const { generateErrorHTMLReport } = require('./utils/generateErrorHTMLReport');
const { handleJSONError } = require('./utils/errorHandling');

// Directory where all bid requests to check are stored
const bidRequestsDir = path.join(__dirname, 'bidRequests');

// Check if the bidRequests directory exists, and create it if not
if (!fs.existsSync(bidRequestsDir)) {
    console.log(`Directory ${bidRequestsDir} not found. Creating the directory...`);
    fs.mkdirSync(bidRequestsDir, { recursive: true });
    console.log(`Please place your bid request files in the ${bidRequestsDir} directory.`);
    return;
}

// Function to process all JSON files in the 'bidRequests' folder
fs.readdir(bidRequestsDir, (err, files) => {
    if (err) {
        console.error('Error reading the folder:', err);
        return;
    }

    // Filter files to keep only JSON files
    const jsonFiles = files.filter(file => path.extname(file) === '.json');

    // If no JSON files are found, notify the user
    if (jsonFiles.length === 0) {
        console.log('No JSON files found in the bidRequests directory.');
        return;
    }

    // Process each JSON file in the folder
    jsonFiles.forEach(file => {
        const filePath = path.join(bidRequestsDir, file);

        // Read and process each JSON file
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading file ${file}:`, err);
                return;
            }

            try {
                const bidRequest = JSON.parse(data); // Parse the JSON file
                console.log(`Bid Request: ${file}`, bidRequest); // Debugging: Output bidRequest to console

                const { missingFields, improvements, usefulFields, interestingFieldsMissing } = checkBidRequest(bidRequest);

                // Generate a valid HTML report
                const htmlContent = generateHTMLReport(missingFields, improvements, usefulFields, interestingFieldsMissing, bidRequest);

                // Save the report and bid request files
                saveFiles(htmlContent, `report_${file.replace('.json', '')}.html`, data, file);
            } catch (error) {
                // Handle JSON parsing errors
                const jsonError = handleJSONError(error, data);
                const htmlContent = generateErrorHTMLReport(jsonError, data);

                // Save only the error report
                saveFiles(htmlContent, `error_report_${file.replace('.json', '')}.html`, data, file);
            }
        });
    });
});

// Helper function to save report files and a copy of the bid request
function saveFiles(htmlContent, reportFileName, bidRequestContent, originalFileName) {
    const currentDateTime = new Date();
    const formattedDateTime = currentDateTime.toISOString().replace(/[:]/g, '-').substring(0, 19);

    // Create the output directory structure in the "Logs" folder with the original file name and timestamp
    const outputDir = path.join(__dirname, 'Logs', `${originalFileName.replace('.json', '')}_${formattedDateTime}`);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save the HTML report
    fs.writeFile(path.join(outputDir, reportFileName), htmlContent.trim(), (err) => {
        if (err) {
            console.error(`Error writing ${reportFileName}:`, err);
        } else {
            console.log(`${reportFileName} generated in ${outputDir}`);
        }
    });

    // Save a copy of the bid request as 'bidRequestCheck.json' (if valid)
    if (!reportFileName.startsWith('error')) {
        fs.writeFile(path.join(outputDir, `bidRequestCheck_${reportFileName.replace('.html', '.json')}`), bidRequestContent.trim(), (err) => {
            if (err) {
                console.error('Error saving bidRequestCheck.json:', err);
            } else {
                console.log(`bidRequestCheck.json saved in ${outputDir}`);
            }
        });
    }
}
