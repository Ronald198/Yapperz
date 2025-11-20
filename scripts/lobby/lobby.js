const filterButtons = document.querySelectorAll('.filters');
let activeFilter = null;


const filterThemeMap = {  //mapping the button IDs to the available themes, so we can easily get the theme based on which button is clicked
    'filter1-btn': 'temple',
    'filter2-btn': 'desert',
    'filter3-btn': 'sea',
    'filter4-btn': 'park'
};

function getRoomTheme(roomCard) { //finding what theme a room has based on its image source
    const themeImg = roomCard.querySelector('.theme-image');
    const imgSrc = themeImg.getAttribute('src');
    
    if (imgSrc.includes('temple')) return 'temple';
    if (imgSrc.includes('desert')) return 'desert';
    if (imgSrc.includes('sea')) return 'sea';
    if (imgSrc.includes('Park')) return 'park';
    
    return null;
}


function filterRooms(theme) {   
    const roomCards = document.querySelectorAll('.room-card');
    
    roomCards.forEach(room => {
        const roomTheme = getRoomTheme(room); //getting the theme from the function above
        
        if (roomTheme === theme) {
            room.style.display = 'flex'; 
        } else {
            room.style.display = 'none'; //hide rooms that are not the selected theme
        }
    });
}


function showAllRooms() {
    const roomCards = document.querySelectorAll('.room-card'); //show all rooms again after filter was selected
    roomCards.forEach(room => {
        room.style.display = 'flex';
    });
}

// Add click event to each filter button
filterButtons.forEach(button => {
    button.addEventListener('click', function() {
        const buttonId = this.getAttribute('id');
        const theme = filterThemeMap[buttonId];
        
        //giving a toggle effect: if the same filter is clicked again, it removes the filter and shows all rooms
        if (activeFilter === theme) {
            showAllRooms();
            activeFilter = null;
            
            filterButtons.forEach(btn => btn.style.opacity = '1'); //distinguishing active filter button
        } else {
            
            filterRooms(theme); //changinf the filter
            activeFilter = theme;
            
            
            filterButtons.forEach(btn => { //distinguishing active filter button by dimming the others
                if (btn.getAttribute('id') === buttonId) {
                    btn.style.opacity = '1';
                } else {
                    btn.style.opacity = '0.5';
                }
            });
        }
    });
});
    


    