document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value;
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        displayResults(data);
        displayChart(data);
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.innerHTML = `<strong>Document ${data.indices[i]}</strong><p>${data.documents[i]}</p><br><strong>Similarity: ${data.similarities[i]}</strong>`;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    console.log('Data received for chart:', data); // Log the data for debugging

    // Validate that data contains the necessary keys
    if (!data.indices || !data.similarities) {
        console.error('Invalid data structure:', data);
        return; // Stop if the data is not structured correctly
    }

    // Rebuild the canvas element to ensure a fresh chart instance
    const chartContainer = document.getElementById('chart-container');
    chartContainer.innerHTML = '<canvas id="similarity-chart"></canvas>'; // Clear and recreate canvas
    const ctx = document.getElementById('similarity-chart').getContext('2d');

    // Extract labels (document indices) and data (similarity scores)
    const labels = data.indices.map(index => `Doc ${index}`);
    const similarities = data.similarities;

    // Create the chart
    window.similarityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // x-axis: Document indices
            datasets: [{
                label: 'Cosine Similarity',
                data: similarities, // y-axis: Similarity scores
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Prevent stretching on resize
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0, // Set the minimum value to 0
                    max: 1, // Set the maximum value to 1
                    title: { display: true, text: 'Cosine Similarity' }
                },
                x: {
                    title: { display: true, text: 'Document Index' }
                }
            }
        }
    });

    console.log('Chart created successfully!');
}
