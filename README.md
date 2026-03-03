<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anonymous Q&A</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f0f2f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .container {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }

        h1 { color: #333; margin-bottom: 20px; }
        
        input {
            width: 80%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }

        button {
            background-color: #6c5ce7;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
        }

        button:hover { background-color: #5b4bc4; }

        .hidden { display: none; }

        #messageList {
            list-style: none;
            padding: 0;
            margin-top: 20px;
            text-align: left;
        }

        .message-card {
            background: #f9f9f9;
            border-left: 4px solid #6c5ce7;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 4px;
            font-size: 14px;
        }

        .link-box {
            background: #eee;
            padding: 10px;
            border-radius: 5px;
            word-break: break-all;
            margin: 15px 0;
            font-family: monospace;
        }
    </style>
</head>
<body>

    <!-- VIEW 1: Create Account -->
    <div class="container" id="createView">
        <h1>Start Anonymous Q&A</h1>
        <p>Enter a username to generate your link.</p>
        <input type="text" id="usernameInput" placeholder="Username (e.g. coolguy)">
        <button onclick="createUser()">Get My Link</button>
    </div>

    <!-- VIEW 2: User Profile (View Messages) -->
    <div class="container hidden" id="profileView">
        <h1>Messages for <span id="displayUsername"></span></h1>
        <div class="link-box" id="shareLink"></div>
        <button onclick="copyLink()" style="background-color: #2ecc71; margin-bottom: 20px;">Copy Link</button>
        <hr>
        <h3>Recent Messages:</h3>
        <ul id="messageList"></ul>
    </div>

    <!-- VIEW 3: Submission Form (Hidden from user, accessed via link) -->
    <div class="container hidden" id="submitView">
        <h1>Send an anonymous message</h1>
        <p>Be kind!</p>
        <textarea id="messageInput" rows="4" style="width: 80%; padding: 10px; border-radius: 8px; border: 1px solid #ddd;" placeholder="Type here..."></textarea>
        <button onclick="submitMessage()">Send</button>
    </div>

    <script>
        // Logic to handle routing between views
        const createView = document.getElementById('createView');
        const profileView = document.getElementById('profileView');
        const submitView = document.getElementById('submitView');
        
        let currentUniqueId = null;

        // 1. Create User
        async function createUser() {
            const username = document.getElementById('usernameInput').value;
            if(!username) return alert("Please enter a username");

            const response = await fetch('/api/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();
            if(data.success) {
                currentUniqueId = data.uniqueId;
                showProfile();
            } else {
                alert("Error creating user");
            }
        }

        // 2. Show Profile
        function showProfile() {
            createView.classList.add('hidden');
            profileView.classList.remove('hidden');
            document.getElementById('displayUsername').innerText = document.getElementById('usernameInput').value;
            document.getElementById('shareLink').innerText = `http://localhost:3000/?id=${currentUniqueId}`;
            loadMessages();
        }

        // 3. Load Messages
        async function loadMessages() {
            const response = await fetch(`/api/get-messages/${currentUniqueId}`);
            const messages = await response.json();
            const list = document.getElementById('messageList');
            list.innerHTML = '';
            
            messages.forEach(msg => {
                const li = document.createElement('li');
                li.className = 'message-card';
                li.innerText = msg.content;
                list.appendChild(li);
            });
        }

        // 4. Submit Message (For visitors)
        async function submitMessage() {
            const content = document.getElementById('messageInput').value;
            if(!content) return alert("Type a message");

            await fetch('/api/submit-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uniqueId: currentUniqueId, content })
            });

            alert("Message sent!");
            document.getElementById('messageInput').value = '';
        }

        // 5. Copy Link
        function copyLink() {
            const linkText = document.getElementById('shareLink').innerText;
            navigator.clipboard.writeText(linkText);
            alert("Link copied!");
        }

        // Check URL parameters on load to see if we are in "Submit" mode
        window.onload = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');

            if (id) {
                // We are on the submission page
                createView.classList.add('hidden');
                profileView.classList.add('hidden');
                submitView.classList.remove('hidden');
                currentUniqueId = id;
            }
        };
    </script>
</body>
</html>