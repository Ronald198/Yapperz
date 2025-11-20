const avatars = [
    // Boy avatars - black hair
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
        src: "../../assets/images/avatars/boy7.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "cosy"
    },
    {
        src: "../../assets/images/avatars/boy8.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/boy9.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "sportive"
    },
    {
        src: "../../assets/images/avatars/boy10.png",
        gender: "male",
        hairColor: "black",
        clothingStyle: "casual"
    },
    
    // Boy avatars - Brunette hair
    {
        src: "../../assets/images/avatars/boy14.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "cosy"
    },
    {
        src: "../../assets/images/avatars/boy16.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/boy17.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "casual"
    },
    {
        src: "../../assets/images/avatars/boy18.png",
        gender: "male",
        hairColor: "brunette",
        clothingStyle: "sportive"
    },
    
    // Boy avatars - Blonde hair (boy19-boy21)
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
    
    // Girl avatars - Black hair
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
     {
        src: "../../assets/images/avatars/girl8.png",
        gender: "female",
        hairColor: "black",
        clothingStyle: "casual"
    },
    // Girl avatars - Blonde hair
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
    // Girl avatars - Brunette hair
    {
        src: "../../assets/images/avatars/girl11.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "sportive"
    },
    {
        src: "../../assets/images/avatars/girl14.png",
        gender: "female",
        hairColor: "black",
        clothingStyle: "cosy"
    },
    {
        src: "../../assets/images/avatars/girl15.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "classic"
    },
    {
        src: "../../assets/images/avatars/girl9.png",
        gender: "female",
        hairColor: "brunette",
        clothingStyle: "cosy"
    }
];

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

let currentCategoryIndex = 0;
let selectedAvatar = null;
let filters = {
    gender: null,
    hairColor: null,
    clothingStyle: null
};

function renderCategory() {
    const category = categories[currentCategoryIndex];
    document.getElementById('categoryName').textContent = category.name;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    category.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
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

function renderAvatars() {
    const avatarGrid = document.getElementById('avatarGrid');
    avatarGrid.innerHTML = '';
    
    const filteredAvatars = avatars.filter(avatar => {
        return (!filters.gender || avatar.gender === filters.gender) &&
               (!filters.hairColor || avatar.hairColor === filters.hairColor) &&
               (!filters.clothingStyle || avatar.clothingStyle === filters.clothingStyle);
    });
    
    filteredAvatars.forEach((avatar, index) => {
        const item = document.createElement('div');
        item.className = 'avatar-item';
        
        if (selectedAvatar === avatar.src) {
            item.classList.add('selected');
        }
        
        const img = document.createElement('img');
        img.src = avatar.src;
        img.alt = 'Avatar';
        img.onerror = function() {
            item.remove();
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

function displayAvatar(src) {
    const avatarFrame = document.getElementById('avatarFrame');
    avatarFrame.classList.remove('empty');
    avatarFrame.innerHTML = `<img src="${src}" alt="Selected Avatar">`;
    
    const img = avatarFrame.querySelector('img');
    img.onerror = function() {
        avatarFrame.classList.add('empty');
        avatarFrame.innerHTML = '';
    };
}

document.getElementById('prevCategory').addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex - 1 + categories.length) % categories.length;
    renderCategory();
});

document.getElementById('nextCategory').addEventListener('click', () => {
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
    renderCategory();
});

renderCategory();
renderAvatars();

