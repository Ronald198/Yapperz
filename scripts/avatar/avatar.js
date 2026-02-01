// Initialize API reference
const api = window.YapperzAPI;

// all available avatars in the system  
const avatars = [
    // each avatar has a gender, hair color, and clothing style 
    // boy avatars - black hair
    {
        src: "../../assets/images/avatars/boy1.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/boy2.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "sportive"
    },
    {
        src: "../../assets/images/avatars/boy3.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/boy4.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "cosy"
    },
    {
        src: "../../assets/images/avatars/boy6.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/boy10.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "casual"
    },
    
    // boy avatars - brunette hair
    {
        src: "../../assets/images/avatars/boy14.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "cosy"
    },
    {
        src: "../../assets/images/avatars/boy18.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "sportive"
    },
    
    // boy avatars - blonde hair
    {
        src: "../../assets/images/avatars/boy19.png",
        gender: "male",
        hairColor: "blonde",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/boy20.png",
        gender: "male",
        hairColor: "blonde",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/boy21.png",
        gender: "male",
        hairColor: "blonde",
        clothingStyle: "cosy"
    },
    
    // girl avatars - black hair
    {
        src: "../../assets/images/avatars/girl1.png",
        gender: "female",
        hairColor: "black",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/girl5.png",
        gender: "female",
        hairColor: "black",
        clothingStyle: "cosy"
    },

    // girl avatars - blonde hair
    {
        src: "../../assets/images/avatars/girl14.png",
        gender: "female",
        hairColor: "blonde",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/girl16.png",
        gender: "female",
        hairColor: "blonde",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/girl17.png",
        gender: "female",
        hairColor: "blonde",
        clothingStyle: "casual"
    },

    // girl avatars - brunette hair
    {
        src: "../../assets/images/avatars/girl11.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/girl15.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "sportive"
    },
    {
        src: "../../assets/images/avatars/girl9.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "classic"
    }
];

  
// used to switch between the available categories
const categories = [
    {
        name: "GENDER",
        key: "gender",
        options: ["male", "female"]
    },
    {
        name: "HAIR COLOR",
        key: "hairColor",
        options: ["blonde", "brunette", "black"]
    },
    {
        name: "CLOTHING STYLE",
        key: "clothingStyle",
        options: ["casual", "classic", "cosy", "sportive"]
    }
];

let currentCategoryIndex = 0; // keeps track of which category we're currently showing
let selectedAvatar = null;    // stores the avatar the user picked
let filters = {
    gender: null,
    hairColor: null,
    clothingStyle: null
};

// renders the current category (gender / hair color / style)
function renderCategory() {
    const category = categories[currentCategoryIndex];
    document.getElementById('categoryName').textContent = category.name;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    category.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn pixel-corners';
        btn.textContent = option;
        
        if (filters[category.key] === option) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', () => {
            if (filters[category.key] === option) {
                filters[category.key] = null;
            } else {
                filters[category.key] = option;
            }
            renderCategory();
            renderAvatars();
        });
        
        optionsContainer.appendChild(btn);
    });
}

// shows all avatars that match the selected filters
function renderAvatars() {
    const avatarGrid = document.getElementById('avatarGrid');
    avatarGrid.innerHTML = '';
    
    // only keep avatars that match all active filters  
    const filteredAvatars = avatars.filter(avatar => {
        return (!filters.gender || avatar.gender === filters.gender) &&
               (!filters.hairColor || avatar.hairColor === filters.hairColor) &&
               (!filters.clothingStyle || avatar.clothingStyle === filters.clothingStyle);
    });
    
    // building the avatar grid
    filteredAvatars.forEach(avatar => {
        const item = document.createElement('div');
        item.className = 'avatar-item pixel-corners';
        
        if (selectedAvatar === avatar.src) {
            item.classList.add('selected');
        }
        
        const img = document.createElement('img');
        img.src = avatar.src;
        img.alt = 'Avatar';

        // FIXED: Silently handle image errors - don't show console errors
        img.onerror = function() {
            // Remove the item from DOM if image doesn't exist
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            // Don't log errors to console - just silently remove
        };
        
        item.appendChild(img);
        
        item.addEventListener('click', () => {
            selectedAvatar = avatar.src;
            displayAvatar(avatar.src);
            renderAvatars();
        });
        
        avatarGrid.appendChild(item);
    });
}

// shows the selected avatar in the center
function displayAvatar(src) {
    const avatarFrame = document.getElementById('avatarFrame');
    avatarFrame.classList.remove('empty');
    avatarFrame.innerHTML = `<img src="${src}" alt="Selected Avatar">`;
    
    // const img = avatarFrame.querySelector('img');
    // // Silently handle image errors for display avatar
    // img.onerror = function() {
    //     avatarFrame.classList.add('empty');
    //     avatarFrame.innerHTML = '';
    //     console.warn('Avatar image not found:', src);
    // };
}

// Load current user's avatar on page load
async function loadCurrentAvatar() {
    try {
        const session = api.getSession();
        if (!session || !session.id) {
            console.error('No user session found');
            return;
        }

        // Get user data to retrieve current avatar
        const userData = await api.request(`/Users/${session.id}`, {
            method: 'GET'
        });

        if (userData && userData.avatarPath) {
            selectedAvatar = userData.avatarPath;
            displayAvatar(userData.avatarPath);
            renderAvatars(); // Re-render to show selection
        }
    } catch (error) {
        console.error('Error loading current avatar:', error);
    }
}

// FIXED: Save avatar function with session update
async function saveAvatar() {
    if (!selectedAvatar) {
        alert('Please select an avatar first!');
        return;
    }

    try {
        const session = api.getSession();
        if (!session || !session.id) {
            alert('You must be logged in to save an avatar');
            return;
        }

        const saveButton = document.getElementById('saveAvatar');
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        // Send update request to backend
        const response = await api.request('/Users/UpdateAvatar', {
            method: 'PUT',
            data: {
                userId: session.id,
                avatarPath: selectedAvatar
            }
        });

        // jQuery promise returns data directly
        console.log('Avatar saved successfully!', response);
        alert('Avatar saved successfully!');
        
        // FIXED: Update the session with the new avatar path
        if (response && response.avatarPath) {
            const updatedSession = api.getSession();
            updatedSession.avatarPath = response.avatarPath;
            api.setSession(updatedSession);
            console.log('Session updated with new avatar:', updatedSession);
        }
        
    } catch (error) {
        console.error('Error saving avatar:', error);
        alert('An error occurred while saving the avatar: ' + (error.message || 'Unknown error'));
    } finally {
        const saveButton = document.getElementById('saveAvatar');
        saveButton.disabled = false;
        saveButton.textContent = 'Save Avatar';
    }
}

// handles switching categories 
document.getElementById('prevCategory').addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
    renderCategory();
});

document.getElementById('nextCategory').addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    renderCategory();
});

// Add save button event listener
document.getElementById('saveAvatar').addEventListener('click', saveAvatar);

// calling functions 
renderCategory();
renderAvatars();
loadCurrentAvatar(); // Load user's current avatar