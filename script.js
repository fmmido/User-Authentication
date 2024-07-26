document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'http://localhost:3000'; // Your JSON server URL

    // Function to load HTML content into a placeholder
    async function loadHTML(url, elementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            document.getElementById(elementId).innerHTML = text;
        } catch (error) {
            console.error('Error loading HTML:', error);
        }
    }

    // Utility functions for cookies
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

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

    function eraseCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }

    function showSection(sectionId) {
        document.querySelectorAll('main > section').forEach(section => {
            section.classList.add('hidden');
        });
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
        } else {
            console.warn(`Element with ID "${sectionId}" not found`);
        }
    }

    function updateNav() {
        const username = getCookie('username');
        console.log('User logged in:', username); // Debug statement

        const navLogin = document.getElementById('nav-login');
        const navSignup = document.getElementById('nav-signup');
        const navLogout = document.getElementById('nav-logout');
        const usernameDisplay = document.getElementById('username-display');

        if (navLogin) {
            console.log('nav-login found');
            navLogin.style.display = username ? 'none' : 'inline';
        } else {
            console.warn('Element with ID "nav-login" not found');
        }

        if (navSignup) {
            console.log('nav-signup found');
            navSignup.style.display = username ? 'none' : 'inline';
        } else {
            console.warn('Element with ID "nav-signup" not found');
        }

        if (navLogout) {
            console.log('nav-logout found');
            navLogout.style.display = username ? 'inline' : 'none';
        } else {
            console.warn('Element with ID "nav-logout" not found');
        }

        if (usernameDisplay) {
            if (username) {
                console.log('username-display found');
                usernameDisplay.textContent = `Logged in as: ${username}`;
                usernameDisplay.classList.remove('hidden');
            } else {
                console.warn('Element with ID "username-display" not found');
                usernameDisplay.classList.add('hidden');
            }
        }

        showSection(username ? 'repo-list' : 'login-section');
        if (username) {
            loadUserRepositories(username); // Load repositories after login
        }
    }

    // Handle Logout
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'nav-logout') {
            event.preventDefault(); // Prevent default link behavior
            console.log('Logout button clicked'); // Debug statement
            eraseCookie('username');
            console.log('Cookie after logout:', getCookie('username')); // Check if cookie is erased
            alert('Logout Successful');
            updateNav();
        }
    });
    

    // Navigation click events
    const navHome = document.getElementById('nav-home');
    const navRepos = document.getElementById('nav-repos');
    const navLogin = document.getElementById('nav-login');
    const navSignup = document.getElementById('nav-signup');

    if (navHome) navHome.addEventListener('click', () => showSection('repo-list'));
    if (navRepos) navRepos.addEventListener('click', () => showSection('repo-list'));
    if (navLogin) navLogin.addEventListener('click', () => showSection('login-section'));
    if (navSignup) navSignup.addEventListener('click', () => showSection('signup-section'));

    // Handle Sign-Up
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('signup-username').value;
            const password = document.getElementById('signup-password').value;

            try {
                const checkResponse = await fetch(`${baseUrl}/users?username=${username}`);
                const existingUsers = await checkResponse.json();

                if (existingUsers.length > 0) {
                    alert('Username already exists');
                    return;
                }

                const response = await fetch(`${baseUrl}/users`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });

                if (response.ok) {
                    alert('Sign-Up Successful');
                    showSection('login-section');
                } else {
                    const error = await response.json();
                    alert(error.error || 'Sign-Up Failed');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // Handle Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(`${baseUrl}/users?username=${username}`);
                const users = await response.json();

                const user = users.find(user => user.username === username && user.password === password);

                if (user) {
                    setCookie('username', username, 1); // Cookie expires in 1 day
                    alert('Login Successful');
                    updateNav();
                } else {
                    alert('Invalid Username or Password');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

// Handle Add Repository
const addRepoForm = document.getElementById('addRepoForm');
if (addRepoForm) {
    addRepoForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const owner = getCookie('username') || 'anonymous'; // Use 'anonymous' if not logged in
        const stars = document.getElementById('stars').value || 0;
        const forks = document.getElementById('forks').value || 0;
        const createdOn = new Date().toISOString(); // Current time as ISO string
        const updatedOn = createdOn; // Initially set updatedOn to createdOn

        try {
            const response = await fetch(`${baseUrl}/repositories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description, owner, stars, forks, created_on: createdOn, updated_on: updatedOn }),
            });

            if (response.ok) {
                alert('Repository Added');
                loadUserRepositories(owner); // Reload the list of repositories for the current user
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to add repository');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
}


    // Load Repositories
async function loadRepositories() {
    try {
        const response = await fetch(`${baseUrl}/repositories`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const repos = await response.json();
        console.log('Loaded repositories:', repos); // Debug statement

        const reposList = document.getElementById('repos');
        if (reposList) {
            reposList.innerHTML = ''; // Clear existing content

            repos.forEach(repo => {
                const listItem = document.createElement('li');
                listItem.className = 'repo-item';
                listItem.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description || 'No description available'}</p>
                    <div class="repo-meta">
                        <span class="repo-stars">⭐ ${repo.stars} Stars</span>
                        <span class="repo-forks">🍴 ${repo.forks} Forks</span>
                        <span class="repo-updated">Updated on ${new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                `;
                reposList.appendChild(listItem);
            });
        } else {
            console.warn('Element with ID "repos" not found');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Function to format relative time
function timeAgo(dateString) {
    const now = new Date();
    const updateTime = new Date(dateString);

    // Log to debug
    console.log('Date String:', dateString);
    console.log('Parsed Date:', updateTime);

    if (isNaN(updateTime)) {
        return 'Invalid Date'; // Handle invalid date cases
    }

    const diffInMinutes = Math.floor((now - updateTime) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    return `${diffInHours} hours ago`;
}


    // Load User Repositories
    async function loadUserRepositories(username) {
        try {
            const response = await fetch(`${baseUrl}/repositories?owner=${username}`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const userRepos = await response.json();
            const reposList = document.getElementById('user-repos');
            reposList.innerHTML = '';
        
            userRepos.forEach(repo => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <h3>${repo.name}</h3>
                    <p>${repo.description}</p>
                    <div class="repo-meta">
                        <span class="repo-stars">⭐ ${repo.stars} Stars</span>
                        <span class="repo-forks">🍴 ${repo.forks} Forks</span>
                        <span class="repo-updated">Last update: ${timeAgo(repo.updated_on)}</span>
                    </div>
                `;
                reposList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Initial setup
    async function initialize() {
        await loadHTML('navbar.html', 'navbar-placeholder');
        await loadHTML('footer.html', 'footer-placeholder');
        updateNav();
        loadRepositories(); // Load general repositories initially
    }

    initialize();
});
