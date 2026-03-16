const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // Replace with your token
const REPO_OWNER = 'YOUR_USERNAME';
const REPO_NAME = 'YOUR_REPO_NAME';
const FILE_PATH = 'data/employees.json';

document.getElementById('employeeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('status');
    status.innerText = "Syncing with GitHub...";

    // 1. Collect Form Data
    const newEmployee = {
        id: document.getElementById('empId').value,
        name: document.getElementById('fullName').value,
        dept: document.getElementById('dept').value,
        hireDate: document.getElementById('hireDate').value,
        timestamp: new Date().toISOString()
    };

    try {
        // 2. Get current file data and its SHA (required for GitHub updates)
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const fileData = await response.json();
        
        // Decode existing content and add new employee
        const currentContent = JSON.parse(atob(fileData.content));
        currentContent.push(newEmployee);

        // 3. Push updated JSON back to GitHub
        const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Add employee ${newEmployee.id}`,
                content: btoa(JSON.stringify(currentContent, null, 2)), // Encode to Base64
                sha: fileData.sha // Required to overwrite
            })
        });

        if (updateResponse.ok) {
            status.innerText = "Successfully saved to GitHub!";
            status.className = "mt-4 text-sm text-center text-green-600";
            document.getElementById('employeeForm').reset();
        }
    } catch (error) {
        status.innerText = "Error: " + error.message;
        status.className = "mt-4 text-sm text-center text-red-600";
    }
});
