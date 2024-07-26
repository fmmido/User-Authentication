document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'http://localhost:3000'; // Your JSON server URL

    // Utility functions for cookies
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Load user profile and repositories
    async function loadUserProfile() {
        const username = getCookie('username');
        if (!username) {
            alert('You must be logged in to view your profile');
            window.location.href = 'login.html'; // Redirect to login page if not logged in
            return;
        }

        try {
            // Fetch user profile information
            const userResponse = await fetch(`${baseUrl}/users?username=${username}`);
            const users = await userResponse.json();
            const user = users[0];

            if (user) {
                document.getElementById('profile-username').textContent = `Username: ${user.username}`;
                document.getElementById('profile-email').textContent = `Email: ${user.email || 'Not provided'}`;
                
                // Load user repositories
                loadUserRepositories(username);
            } else {
                alert('User not found');
                window.location.href = 'login.html'; // Redirect if user not found
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadUserRepositories(username) {
        try {
            const response = await fetch(`${baseUrl}/repositories?owner=${username}`);
            if (!response.ok) throw new Error('Network response was not ok');

            const userRepos = await response.json();
            const reposList = document.getElementById('repo-list'); // Ensure ID matches HTML
            reposList.innerHTML = '';

            userRepos.forEach(repo => {
                const repoItem = document.createElement('div');
                repoItem.className = 'repo-item'; // Use class for styling
                repoItem.innerHTML = `
                    <h3><a href="${repo.url}" target="_blank">${repo.name}</a></h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-meta">
                        <span class="repo-stars">⭐ ${repo.stars || 0} Stars</span>
                        <span class="repo-forks">🍴 ${repo.forks || 0} Forks</span>
                        <span class="repo-updated">Updated on ${new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                `;
                reposList.appendChild(repoItem);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    loadUserProfile();
});
