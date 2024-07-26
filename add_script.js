document.getElementById('addRepoForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const owner = document.getElementById('owner').value;

    const newRepo = {
        id: Date.now(), // Unique ID based on timestamp
        name: name,
        description: description,
        owner: owner,
        created_at: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
    };

    fetch('add_repo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRepo)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Repository added successfully');
            window.location.href = 'index.html'; // Redirect to the repository list
        } else {
            alert('Error adding repository');
        }
    })
    .catch(error => {
        console.error('Error adding repository:', error);
    });
});
