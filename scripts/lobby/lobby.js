const API_BASE_URL = 'https://localhost:7246/api';

// Room filter functionality
const filterButtons = document.querySelectorAll('.filters');
let activeFilter = null;

// Map filter buttons to their themes
const filterThemeMap = {
    'filter1-btn': 'temple',
    'filter2-btn': 'desert',
    'filter3-btn': 'sea',
    'filter4-btn': 'park'
};

// Get theme from room card's image src
function getRoomTheme(roomCard) {
    const themeImg = roomCard.querySelector('.theme-image');
    const imgSrc = themeImg.getAttribute('src');
    
    if (imgSrc.includes('temple')) return 'temple';
    if (imgSrc.includes('desert')) return 'desert';
    if (imgSrc.includes('sea')) return 'sea';
    if (imgSrc.includes('Park')) return 'park';
    
    return null;
}

// Filter rooms based on theme
function filterRooms(theme) {
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(room => {
        const roomTheme = getRoomTheme(room);
        
        if (roomTheme === theme) {
            room.style.display = 'flex'; // Show matching rooms
        } else {
            room.style.display = 'none'; // Hide non-matching rooms
        }
    });
}

// Show all rooms
function showAllRooms() {
    const roomCards = document.querySelectorAll('.room-card');
    roomCards.forEach(room => {
        room.style.display = 'flex';
    });
}

// Add click event to each filter button
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const buttonId = this.getAttribute('id');
        const theme = filterThemeMap[buttonId];
        
        // If clicking the same button, toggle off the filter
        if (activeFilter === theme) {
            showAllRooms();
            activeFilter = null;
            // Remove active styling from all buttons
            filterButtons.forEach(btn => btn.style.opacity = '1');
        } else {
            // Apply new filter
            filterRooms(theme);
            activeFilter = theme;
            
            // Visual feedback: dim inactive buttons
            filterButtons.forEach(btn => {
                if (btn.getAttribute('id') === buttonId) {
                    btn.style.opacity = '1';
                } else {
                    btn.style.opacity = '0.5';
                }
            });
        }
    });
});

// ============ AJAX API FUNCTIONS ============

// Create a new chatroom
function createChatroom(roomData) {
    console.log('Sending request to:', `${API_BASE_URL}/ChatRoom`);
    console.log('Request data:', roomData);
    
    $.ajax({
        url: `${API_BASE_URL}/ChatRoom`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            name: roomData.name,
            description: roomData.description,
            theme: roomData.theme,
            maxPlayers: roomData.maxPlayers || 10
        }),
        success: function(response) {
            console.log('Chatroom created successfully:', response);

            
            addRoomCardToUI(response);

            
            document.getElementById('room-open').hidePopover();

            
            document.getElementById('room-name').value = '';
            document.getElementById('room-description').value = '';

           
            window.location.href = `pages/chatroom/chatroom.html?code=${response.code}`;
        },

        error: function(xhr, status, error) {
            console.error('Error creating chatroom:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);
            console.error('Status Code:', xhr.status);
            alert('Failed to create chatroom. Check console for details.');
        }
    });
}

// Delete a chatroom by ID
function deleteChatroom(chatroomId) {
    if (!confirm('Are you sure you want to delete this chatroom?')) {
        return;
    }
    
    $.ajax({
        url: `${API_BASE_URL}/ChatRoom/${chatroomId}`,
        type: 'DELETE',
        success: function(response) {
            console.log('Chatroom deleted successfully:', response);
            alert(response.message);
            
            // Remove the room card from UI
            const roomCard = document.querySelector(`[data-room-id="${chatroomId}"]`);
            if (roomCard) {
                roomCard.remove();
            }
        },
        error: function(xhr, status, error) {
            console.error('Error deleting chatroom:', error);
            alert('Failed to delete chatroom: ' + (xhr.responseJSON?.message || error));
        }
    });
}
//function to delete the room when the last user leaves
function leaveRoom(roomId, userId) {
    $.ajax({
        url: `${API_BASE_URL}/ChatRoom/${roomId}/leave/${userId}`,
        type: 'POST',
        success: function () {
            window.location.href = "/index.html";
        },
        error: function (xhr) {
            console.error(xhr.responseText);
            window.location.href = "/index.html"; // still leave UI
        }
    });
}


// Helper function to add a room card to the UI
function addRoomCardToUI(room) {
    const roomsContainer = document.getElementById('rooms');
    
    // Map theme to image
    const themeImages = {
        'desert': 'assets/images/backgrounds/desert.png',
        'sea': 'assets/images/backgrounds/sea.jpg',
        'park': 'assets/images/backgrounds/simplePark.jpg',
        'temple': 'assets/images/backgrounds/temple.png'
    };
    
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card rooms pixel-corners';
    roomCard.setAttribute('data-room-id', room.id);
    
    roomCard.innerHTML = `
        <div class="room-left">
            <div class="room-main">
                <h2 class="room-title">${room.name}</h2>
                <div class="room-description">
                    <label class="room-des-label">About</label>
                    <p>${room.description || 'No description'}</p>
                </div>
            </div>
        </div>
        <div class="room-right">
            <div class="room-theme">
                <label>Room theme</label>
                <div class="theme-image-wrap">
                    <img src="${themeImages[room.theme.toLowerCase()]}" alt="theme" class="theme-image">
                </div>
            </div>
            <button class="join-room-btn" data-room-code="${room.code}">Join Room</button>
        </div>
    `;
    
    roomsContainer.appendChild(roomCard);
}

// ============ EVENT LISTENERS ============

// Handle create room button click (button already exists in HTML)
document.getElementById('create-room-btn').addEventListener('click', function(e) {
    e.preventDefault(); // Prevent the anchor tag from navigating
    e.stopPropagation(); // Stop event bubbling
    
    const roomName = document.getElementById('room-name').value.trim();
    const roomDescription = document.getElementById('room-description').value.trim();
    const roomTheme = document.getElementById('room-theme').value;
    const maxPlayers = parseInt(document.getElementById('max-participants').value);
    
    console.log('Create button clicked!', { roomName, roomDescription, roomTheme, maxPlayers });
    
    if (!roomName) {
        alert('Please enter a room name');
        return;
    }
    
    if (maxPlayers < 2 || maxPlayers > 25) {
        alert('Max participants must be between 2 and 25');
        return;
    }
    
    createChatroom({
        name: roomName,
        description: roomDescription,
        theme: roomTheme,
        maxPlayers: maxPlayers
    });
    
    return false; // Extra prevention of navigation
});

// Handle join room button clicks (event delegation)
document.getElementById('rooms').addEventListener('click', function(e) {
    if (e.target.classList.contains('join-room-btn')) {
        const roomCode = e.target.getAttribute('data-room-code');
        console.log('Joining room with code:', roomCode);
        
        // Update the path based on your actual file structure
        // If lobby.html is in root and chatroom.html is in pages/chatroom/
        window.location.href = `pages/chatroom/chatroom.html?code=${roomCode}`;
    }
});

// Handle enter room button click (manual room code entry)
document.getElementById('enter-room-btn').addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const roomCode = document.getElementById('room-code').value.trim();
    
    console.log('Entering room with code:', roomCode);
    
    if (!roomCode) {
        alert('Please enter a room code');
        return;
    }
    
    // Redirect to chatroom with the room code
    window.location.href = `pages/chatroom/chatroom.html?code=${roomCode}`;
    
    return false;
});

// Load all chatrooms from the database
function loadChatrooms() {
    $.ajax({
        url: `${API_BASE_URL}/ChatRoom`,
        type: 'GET',
        success: function(chatrooms) {
            console.log('Chatrooms loaded from database:', chatrooms);
            
            // Add each room from the database to the UI
            chatrooms.forEach(room => {
                addRoomCardToUI(room);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error loading chatrooms:', error);
            console.error('Make sure you have a GET endpoint in your ChatRoomController');
        }
    });
}

// Load chatrooms when the page loads
$(document).ready(function() {
    loadChatrooms();
});

