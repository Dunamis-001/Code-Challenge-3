document.addEventListener('DOMContentLoaded', () => {
    const guestForm = document.getElementById('guestForm');
    const guestNameInput = document.getElementById('guestNameInput');
    const guestCategorySelect = document.getElementById('guestCategorySelect');
    const guestList = document.getElementById('guestList');
    const guestCountDisplay = document.getElementById('guestCount');

    const MAX_GUESTS = 10;
    let guests = []; // Array to store guest objects

    // Function to update guest count display
    function updateGuestCount() {
        guestCountDisplay.textContent = `Total Guests: ${guests.length}/${MAX_GUESTS}`;
    }

    // Function to render the guest list
    function renderGuestList() {
        guestList.innerHTML = ''; // Clear existing list
        guests.forEach((guest, index) => {
            const listItem = document.createElement('li');
            listItem.classList.add('guest-list-item'); // Add a class for potential future styling

            const guestInfo = document.createElement('div');
            guestInfo.classList.add('guest-info');

            const guestNameSpan = document.createElement('span');
            guestNameSpan.classList.add('guest-name');
            guestNameSpan.textContent = guest.name;

            const categoryTag = document.createElement('span');
            categoryTag.classList.add('category-tag', `category-${guest.category}`);
            categoryTag.textContent = guest.category;

            const guestMeta = document.createElement('div');
            guestMeta.classList.add('guest-meta');

            const addedTime = new Date(guest.timestamp).toLocaleString();
            const timeSpan = document.createElement('span');
            timeSpan.textContent = `Added: ${addedTime}`;

            const rsvpStatusSpan = document.createElement('span');
            rsvpStatusSpan.classList.add(guest.attending ? 'attending' : 'not-attending');
            rsvpStatusSpan.textContent = guest.attending ? 'Attending' : 'Not Attending';

            guestMeta.appendChild(timeSpan);
            guestMeta.appendChild(document.createTextNode(' | ')); // Separator
            guestMeta.appendChild(rsvpStatusSpan);

            guestInfo.appendChild(guestNameSpan);
            guestInfo.appendChild(categoryTag);
            guestInfo.appendChild(guestMeta);


            const guestActions = document.createElement('div');
            guestActions.classList.add('guest-actions');

            // Toggle RSVP Button
            const toggleRsvpBtn = document.createElement('button');
            toggleRsvpBtn.classList.add('toggle-rsvp-btn');
            toggleRsvpBtn.textContent = 'Toggle RSVP';
            toggleRsvpBtn.addEventListener('click', () => toggleRsvp(index));

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-btn');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => editGuest(index));

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Remove';
            deleteBtn.addEventListener('click', () => removeGuest(index));

            guestActions.appendChild(toggleRsvpBtn);
            guestActions.appendChild(editBtn);
            guestActions.appendChild(deleteBtn);

            listItem.appendChild(guestInfo);
            listItem.appendChild(guestActions);

            guestList.appendChild(listItem);
        });
        updateGuestCount();
    }

    // Handle form submission
    guestForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page refresh

        const guestName = guestNameInput.value.trim();
        const guestCategory = guestCategorySelect.value;

        if (guestName === '') {
            alert('Please enter a guest name.');
            return;
        }

        if (guests.length >= MAX_GUESTS) {
            alert(`The guest list is full! (Max ${MAX_GUESTS} guests)`);
            return;
        }

        const newGuest = {
            name: guestName,
            attending: true, // Default to attending
            category: guestCategory,
            timestamp: new Date().toISOString() // Store time added
        };

        guests.push(newGuest);
        guestNameInput.value = ''; // Clear input field
        renderGuestList();
    });

    // Function to remove a guest
    function removeGuest(index) {
        if (confirm(`Are you sure you want to remove ${guests[index].name}?`)) {
            guests.splice(index, 1);
            renderGuestList();
        }
    }

    // Function to toggle RSVP status
    function toggleRsvp(index) {
        guests[index].attending = !guests[index].attending;
        renderGuestList();
    }

    // Function to edit a guest's name
    function editGuest(index) {
        const listItem = guestList.children[index];
        const guestNameSpan = listItem.querySelector('.guest-name');
        const currentName = guests[index].name;

        // Create an input field for editing
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = currentName;
        editInput.classList.add('edit-guest-input');

        // Replace the name span with the input field
        guestNameSpan.replaceWith(editInput);
        editInput.focus(); // Focus on the input field

        // Change the Edit button to a Save button
        const editBtn = listItem.querySelector('.edit-btn');
        editBtn.textContent = 'Save';
        editBtn.removeEventListener('click', () => editGuest(index)); // Remove old listener
        editBtn.addEventListener('click', () => saveGuestEdit(index, editInput));

        // Add event listener for "Enter" key to save
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveGuestEdit(index, editInput);
            }
        });

        // Add class to list item to indicate editing mode (for styling)
        listItem.classList.add('editing');
    }

    // Function to save guest name edit
    function saveGuestEdit(index, editInput) {
        const newName = editInput.value.trim();
        if (newName === '') {
            alert('Guest name cannot be empty.');
            editInput.focus();
            return;
        }

        guests[index].name = newName;
        renderGuestList(); // Re-render to update the display
    }


    // Initial render when the page loads
    renderGuestList();
});


