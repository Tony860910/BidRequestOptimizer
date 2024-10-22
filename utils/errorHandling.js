// utils/errorHandling.js

// Function to handle JSON parsing errors and generate an error HTML report
function handleJSONError(error, jsonData) {
    let errorMessage = 'The JSON is invalid. Please check the structure of the JSON file.';
    let errorDetails = error.message;
    let lineNumber = null;
    let specificErrorMessage = '';

    // Detect specific JSON errors and extract line number
    if (errorDetails.includes('Unexpected token') || errorDetails.includes('Expected')) {
        errorMessage = 'There seems to be a syntax error in the JSON file.';
        
        // Extract line number if available in the error message
        const lineMatch = errorDetails.match(/line (\d+)/);
        if (lineMatch) {
            lineNumber = lineMatch[1];

            // Customize the message based on the error details
            if (errorDetails.includes("Expected ',' or '}'")) {
                specificErrorMessage = `There is a missing ',' or '}' at line ${lineNumber}.`;
            } else if (errorDetails.includes('Unexpected token }')) {
                specificErrorMessage = `There is an extra comma at line ${lineNumber}. Please remove it.`;
            } else {
                specificErrorMessage = `Please check the JSON at line ${lineNumber}.`;
            }
        }
    }

    return {
        message: errorMessage,
        specificErrorMessage: specificErrorMessage,
        errorDetails: error.message,
        lineNumber: lineNumber
    };
}

module.exports = { handleJSONError };
