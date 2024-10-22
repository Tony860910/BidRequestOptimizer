// utils/generateErrorHTMLReport.js

// Function to generate an elegant HTML report when there is a JSON error
function generateErrorHTMLReport(error, jsonData) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Bid Request Check Report - Error</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                h1 {
                    color: #444;
                    font-size: 24px;
                    text-align: center;
                    margin-bottom: 20px;
                }
                .container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .error-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #ff5c5c;
                    margin-bottom: 10px;
                }
                .error-message {
                    font-size: 16px;
                    color: #ff5c5c;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .error-details {
                    font-size: 14px;
                    color: #555;
                    background-color: #f4f4f4;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    line-height: 1.6;
                }
                .example-container {
                    background-color: #f4f4f4;
                    padding: 15px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    font-family: 'Courier New', Courier, monospace;
                }
                .example-container pre {
                    font-size: 14px;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                footer {
                    text-align: center;
                    font-size: 12px;
                    color: #888;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Bid Request Check Report - Error</h1>
            <div class="container">
                <div class="error-title">An error occurred while processing the JSON file:</div>
                <div class="error-message">${error.specificErrorMessage}</div>
                <div class="error-details">
                    <strong>Details:</strong> 
                    <pre>${error.errorDetails}</pre>
                </div>
                <div class="example-container">
                    <strong>Example for an extra comma:</strong>
                    <pre>
    "device": {
        "language": "en",
        "devicetype": 6,
        "ip": "22.11.XX.XX",  // <- Ensure no comma here
    }
                    </pre>
                </div>
                <div class="example-container">
                    <strong>Example for a missing '}' :</strong>
                    <pre>
    "device": {
        "devicetype": 6,
        "ip": "73.141.79.240" // <- Check for missing '}'
                    </pre>
                </div>
            </div>
            <footer>JSON Error Report Generated Automatically</footer>
        </body>
        </html>
    `;
}

module.exports = { generateErrorHTMLReport };

