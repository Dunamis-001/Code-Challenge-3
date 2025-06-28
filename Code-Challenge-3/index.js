// Base URL for our local JSON server API.
const BASE_URL = 'http://localhost:3000/posts';

//DOM Element References

const postListDiv = document.getElementById('post-list'); // The div where we'll show all blog post titles
const postDetailDiv = document.getElementById('post-detail'); // The div where we'll show a single post's full details
const newPostForm = document.getElementById('new-post-form'); // The form used for adding/editing posts
const postIdInput = document.getElementById('post-id'); // A hidden input to store the ID when editing a post
const postTitleInput = document.getElementById('post-title-input'); // The input field for the post title
const postContentInput = document.getElementById('post-content-input'); // The textarea for the post content
const postAuthorInput = document.getElementById('post-author-input'); // The input field for the post author
const postImageInput = document.getElementById('post-image-input'); // The input field for the post image URL
const submitPostButton = document.getElementById('submit-post-button'); // The button to submit the form (Add or Update)
const cancelEditButton = document.getElementById('cancel-edit-button'); // The button to cancel an edit operation


// displayPosts function:
// asynchronous function fetches all blog posts from our JSON server API
// and then renders them as a list in the `#post-list` div.

async function displayPosts() {
    console.log('Fetching all posts...'); // Log to the console for debugging/tracking
    
    // Display a "Loading..." message immediately.
    postListDiv.innerHTML = '<p>Loading posts...</p>'; 

    try {
        // API Call: GET /posts 
        // `fetch(BASE_URL)` sends an HTTP GET request to our API endpoint.
        const response = await fetch(BASE_URL); 
        
        // Check if the network request was successful 
        // If 'response.ok' is false, it means there was an HTTP error
        if (!response.ok) {
            // Throw an error to be caught by the `catch` block below.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON data from the response body into a JavaScript array of post objects.
        const posts = await response.json(); 

        // Clear the current content of the post list div.
        postListDiv.innerHTML = ''; 
        
        // If the API returns an empty array, display a message indicating no posts.
        if (posts.length === 0) {
            postListDiv.innerHTML = '<p>No posts available. Add a new one!</p>';
            return;
        }

        // Loop through each post object in the 'posts' array.
        posts.forEach(post => {
            // Create a new `div` element for each individual blog post in the list.
            const postItem = document.createElement('div');
            // Add a CSS class for styling. 
            postItem.classList.add('post-item'); 

            // img element for the post's image.
            const postImage = document.createElement('img');
            postImage.classList.add('post-item-image');
            // src attribute. If post.image is missing, use generic placeholder image.
            postImage.src = post.image || 'https://placehold.co/80x80/CCCCCC/000000?text=No+Image'; 
            // Set the `alt` attribute for accessibility. Screen readers use this if the image can't load.
            postImage.alt = post.title; 
            // onerror event handler for the image. If the image fails to load,
            // it will replace its `src` with a different error placeholder image.
            postImage.onerror = function() {
                this.onerror = null; // Prevent infinite loop if the error placeholder also fails.
                this.src = 'https://placehold.co/80x80/CCCCCC/000000?text=Error';
            };

            // div to hold the post title 
            const postContent = document.createElement('div');
            postContent.classList.add('post-item-content');

            // h3 element for the post title.
            const postTitle = document.createElement('h3');
            postTitle.textContent = post.title; // Set the text content of the title.
            // Add click event listener to the post title.
            // When the title is clicked, it will call `handlePostClick` with the post's ID.
            postTitle.addEventListener('click', () => handlePostClick(post.id)); 

            // div to hold the action buttons (Edit, Delete).
            const postActions = document.createElement('div');
            postActions.classList.add('post-item-actions');

            // Edit button.
            const editButton = document.createElement('button');
            editButton.classList.add('edit'); // CSS class for styling
            editButton.textContent = 'Edit';
            // click listener to call `handleEditClick` with the post's ID.
            editButton.addEventListener('click', () => handleEditClick(post.id));

            // Delete button.
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete'); // CSS class for styling
            deleteButton.textContent = 'Delete';
            // click listener to call `handleDeleteClick` with the post's ID.
            deleteButton.addEventListener('click', () => handleDeleteClick(post.id));

            // Post item:
            postContent.appendChild(postTitle); // Put the title inside its content div.
            postActions.appendChild(editButton); // Put the edit button inside its actions div.
            postActions.appendChild(deleteButton); // Put the delete button inside its actions div.
            
            postItem.appendChild(postImage); // Add the image to the main post item div.
            postItem.appendChild(postContent); // Add the text content to the main post item div.
            postItem.appendChild(postActions); // Add the action buttons to the main post item div.

            postListDiv.appendChild(postItem); // Add the complete post item to the list container.
        });
    } catch (error) {
        // If any error occurs during the fetch or processing, log it and display a user-friendly message.
        console.error('Error fetching posts:', error);
        postListDiv.innerHTML = `<p style="color: red;">Failed to load posts: ${error.message}. <br>Please ensure json-server is running.</p>`;
    }
}

// handlePostClick function:
// This asynchronous function fetches and displays the detailed information
// of a single blog post in the `#post-detail` div.

async function handlePostClick(postId) {
    console.log(`Fetching details for post ID: ${postId}`);
    // Display a "Loading..." message in the detail section while fetching.
    postDetailDiv.innerHTML = '<p>Loading post details...</p>'; 

    try {
        // API Call: GET /posts/:id 
        // Fetch a specific post using its ID appended to the base URL.
        const response = await fetch(`${BASE_URL}/${postId}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Parse the JSON response for the single post.
        const post = await response.json(); 

        // Update the `#post-detail` div with the fetched post's data.
     
        postDetailDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p><strong>Author:</strong> ${post.author}</p>
            <p>${post.content}</p>
            <!-- Only include the image tag if an image URL exists for the post. -->
            <!-- The 'onerror' handler is included here too, in case the detail image fails to load. -->
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="detail-image" onerror="this.onerror=null;this.src='https://placehold.co/400x200/CCCCCC/000000?text=Image+Load+Error';">` : ''}
        `;
    } catch (error) {
        console.error(`Error fetching post ${postId}:`, error);
        postDetailDiv.innerHTML = `<p style="color: red;">Failed to load post details: ${error.message}</p>`;
    }
}

// handleSubmitPost function:
// This asynchronous function handles the submission of the new/edit post form.
// It determines if the user is adding a new post or updating an existing one
// based on whether a `post-id` is present in the hidden input field.

async function handleSubmitPost(event) {
    // Prevent the default browser behavior for form submission, which is to reload the page.
    event.preventDefault(); 

    // Get the values from the form input fields.
    // `.trim()` removes any leading or trailing whitespace, ensuring cleaner data.
    const id = postIdInput.value; // Get the hidden post ID (will be empty string if adding new)
    const title = postTitleInput.value.trim(); 
    const content = postContentInput.value.trim(); 
    const author = postAuthorInput.value.trim(); 
    const image = postImageInput.value.trim(); 

    // Input Validation 
    // Check if all required fields are filled.
    if (!title || !content || !author || !image) {
        console.error("Form Validation Error: All fields are required.");
        // Use our custom `alertBox` for user feedback instead of the browser's native `alert()`.
        alertBox('Error', 'All form fields are required.'); 
        return; // Stop the function execution if validation fails.
    }

    // JavaScript object with the post data.
    const postData = { title, content, author, image }; 
    console.log("Attempting to submit post with data:", postData); // Log data for debugging
    
    let url = BASE_URL; // Default URL for adding a new post (POST request)
    let method = 'POST'; // Default HTTP method for adding a new post

    // If the `id` hidden input has a value, it means we are in "edit" mode.
    if (id) {
        url = `${BASE_URL}/${id}`; // The URL changes to target a specific post for update.
        method = 'PATCH'; // Use the PATCH method for updating existing resources.
        // PATCH over PUT for partial updates where not all fields are necessarily sent.
    }

    try {
        // Send the HTTP request to the API.
        const response = await fetch(url, {
            method: method, // POST for new, PATCH for update
            headers: {
                // Tell the server we are sending JSON data.
                'Content-Type': 'application/json', 
            },
            // Convert the JavaScript object (`postData`) into a JSON string
            body: JSON.stringify(postData), 
        });

        // Check for HTTP errors
        if (!response.ok) {
            const errorText = await response.text(); 
            console.error(`API Error: HTTP status ${response.status}. Response text: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}. Details: ${errorText}`);
        }

        // Parse the JSON response from the server.
        // POST -returns the newly created resource.
        // PATCH - returns the updated resource.
        const result = await response.json(); 
        console.log(`Post ${method === 'POST' ? 'added' : 'updated'}:`, result);

        // After successfully adding/updating, refresh the list of posts.
     
        await displayPosts();
        // Immediately display the details of the newly added/updated post for quick user feedback.
        await handlePostClick(result.id);

        // Reset the form fields and buttons back to their "Add Post" state.
        resetForm(); 
        // Show a success message to the user.
        alertBox('Success', `Post successfully ${method === 'POST' ? 'added' : 'updated'}!`); 
    } catch (error) {
        // Handle any errors that occur during the API request or processing.
        console.error(`Error ${method === 'POST' ? 'adding' : 'updating'} post:`, error);
        alertBox('Error', `Failed to ${method === 'POST' ? 'add' : 'update'} post: ${error.message}`);
    }
}

// handleEditClick function:
// This asynchronous function is called when the "Edit" button next to a post title is clicked.
// It fetches the data for that specific post and populates the form fields with it,
// preparing the form for an update operation.

async function handleEditClick(postId) {
    try {
        // Fetch the data for the specific post to be edited.
        const response = await fetch(`${BASE_URL}/${postId}`); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const postToEdit = await response.json(); 

        // Populate the form fields with the fetched post's data.
        postIdInput.value = postToEdit.id; // Set the hidden ID field.
        postTitleInput.value = postToEdit.title;
        postContentInput.value = postToEdit.content;
        postAuthorInput.value = postToEdit.author;
        postImageInput.value = postToEdit.image;

        // Change the submit button text to "Update Post" to indicate the current mode.
        submitPostButton.textContent = 'Update Post';
        // Show the "Cancel Edit" button, allowing the user to abandon the edit.
        cancelEditButton.style.display = 'inline-block';

        // smoothly scroll the page so the user's view moves to the form.
        newPostForm.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error(`Error fetching post for edit ${postId}:`, error);
        alertBox('Error', `Failed to load post for editing: ${error.message}`);
    }
}

// handleDeleteClick function:
// This asynchronous function is called when the "Delete" button is clicked.
// It prompts the user for confirmation and, if confirmed, sends a DELETE request
// to the server to remove the post.

async function handleDeleteClick(postId) {
    // The `await` keyword pauses execution until the user clicks "Yes" or "No".
    const confirmed = await confirmBox('Confirm Delete', 'Are you sure you want to delete this post? This action cannot be undone.');
    // If the user clicks "No" (or cancels), stop the function.
    if (!confirmed) {
        return; 
    }

    try {
        // API Call: DELETE /posts/:id 
        // Send an HTTP DELETE request to remove the post by its ID.
        const response = await fetch(`${BASE_URL}/${postId}`, {
            method: 'DELETE', 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`Post ${postId} deleted successfully.`);
        alertBox('Success', 'Post deleted successfully!'); // Inform the user

        // Refresh the list of posts after deletion to update the UI.
        await displayPosts();
        
        // Clear the post detail section in case the deleted post was currently displayed.
        // This ensures the UI is consistent.
        postDetailDiv.innerHTML = '<p>Click on a post title to see details.</p>';

    } catch (error) {
        console.error(`Error deleting post ${postId}:`, error);
        alertBox('Error', `Failed to delete post: ${error.message}`);
    }
}

// ResetForm function:
// This function clears all the input fields in the new/edit post form
// and resets the submit button text and hides the cancel edit button.
// It's called after successful submission or when the "Cancel Edit" button is clicked.

function resetForm() {
    postIdInput.value = ''; // Clear the hidden ID field
    newPostForm.reset(); // Use the built-in form method to clear all inputs
    submitPostButton.textContent = 'Add Post'; // Change button text back to "Add Post"
    cancelEditButton.style.display = 'none'; // Hide the cancel edit button
    // Re-set the default image URL in case it was changed during an edit.
    postImageInput.value = 'https://placehold.co/400x200/CCCCCC/000000?text=New+Post'; 
}


// AlertBox` function:
// This is a custom implementation of an alert box.
// {string} title - The title text for the alert box.
// {string} message - The message content for the alert box.

function alertBox(title, message) {
    const dialog = document.createElement('div'); // Create the main dialog container
    dialog.classList.add('custom-dialog'); 
    
    // Inner HTML of the dialog, including a title, message, and an OK button.
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>${title}</h3>
            <p>${message}</p>
            <button class="dialog-ok-button">OK</button>
        </div>
    `;
    document.body.appendChild(dialog); // Add the dialog to the very end of the HTML body.

    // Add an event listener to the "OK" button within the dialog.
    // When clicked, it removes the dialog from the DOM.
    dialog.querySelector('.dialog-ok-button').addEventListener('click', () => {
        dialog.remove(); 
    });

    // Dynamic CSS Injection for Dialogs 
    // CSS for custom-dialog is only added once
    
    if (!document.getElementById('dialog-styles')) {
        const style = document.createElement('style');
        style.id = 'dialog-styles'; // Assign an ID to check if it's already injected
        // Define the CSS rules 
        style.textContent = `
            .custom-dialog {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0, 0, 0, 0.5); /* Dimmed overlay */
                display: flex; justify-content: center; align-items: center;
                z-index: 1000; /* Ensure it's on top */
            }
            .dialog-content {
                background: white; padding: 30px; border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); text-align: center;
                max-width: 400px; width: 90%; box-sizing: border-box;
                border-radius: 8px;
            }
            .dialog-content h3 { margin-top: 0; color: #333; font-size: 1.5em; margin-bottom: 15px; }
            .dialog-content p { margin-bottom: 25px; color: #555; }
            .dialog-ok-button {
                background-color: #4CAF50; color: white; border: none;
                padding: 10px 20px; border-radius: 6px; cursor: pointer;
                font-size: 1em; transition: background-color 0.2s ease, transform 0.2s ease;
            }
            .dialog-ok-button:hover { background-color: #45a049; transform: translateY(-2px); }
        `;
        document.head.appendChild(style); // Adding style element to the document's head
    }
}

// ConfirmBox function:
// It returns a Promise, which allows us to `await` the user's choice.
// Parameter {string} title - The title text for the confirmation box.
// Prameter {string} message - The message content for the confirmation box.
// Returns {Promise<boolean>} - Resolves with `true` if "Yes" is clicked, `false` if "No".

function confirmBox(title, message) {
    // Return a new Promise. The resolve function will be called when the user makes a choice.
    return new Promise(resolve => {
        const dialog = document.createElement('div');
        dialog.classList.add('custom-dialog');
        
        // HTML content with "Yes" and "No" buttons.
        dialog.innerHTML = `
            <div class="dialog-content">
                <h3>${title}</h3>
                <p>${message}</p>
                <button class="dialog-confirm-button">Yes</button>
                <button class="dialog-cancel-button">No</button>
            </div>
        `;
        document.body.appendChild(dialog);

        // Event listener for the "Yes" button: resolve the Promise with `true`.
        dialog.querySelector('.dialog-confirm-button').addEventListener('click', () => {
            dialog.remove(); // Remove dialog from DOM
            resolve(true); // User confirmed
        });

        // Event listener for the "No" button: resolve the Promise with `false`.
        dialog.querySelector('.dialog-cancel-button').addEventListener('click', () => {
            dialog.remove(); // Remove dialog from DOM
            resolve(false); // User cancelled
        });

        // Dynamic CSS injection for confirm dialog.
        if (!document.getElementById('confirm-dialog-styles')) {
            const style = document.createElement('style');
            style.id = 'confirm-dialog-styles';
            style.textContent = `
                /* Reusing .custom-dialog and .dialog-content styles from alertBox for consistency */
                .dialog-confirm-button, .dialog-cancel-button {
                    background-color: #007bff; color: white; border: none;
                    padding: 10px 20px; border-radius: 6px; cursor: pointer;
                    font-size: 1em; margin: 0 10px;
                    transition: background-color 0.2s ease, transform 0.2s ease;
                }
                .dialog-confirm-button:hover { background-color: #0056b3; transform: translateY(-2px); }
                .dialog-cancel-button { background-color: #dc3545; }
                .dialog-cancel-button:hover { background-color: #c82333; transform: translateY(-2px); }
            `;
            document.head.appendChild(style);
        }
    });
}


// setupFormListeners` function:
// responsible for attaching all the necessary event listeners to the form elements, making the form interactive.

function setupFormListeners() {
    // handleSubmitPost function attached to the submit event of the form.
    // This function will be called when the user clicks the submit button or presses Enter
    newPostForm.addEventListener('submit', handleSubmitPost); 
    
    // resetForm function attached to the 'click' event of the "Cancel Edit" button.
    // This allows the user to clear the form and go back to "Add Post" mode.
    cancelEditButton.addEventListener('click', resetForm); 
}

// main function:
// Entry point for JS application logic.
// orchestrates the initial setup of the page.
function main() {
    console.log('DOM fully loaded and parsed. Initializing application...');
    // Call `displayPosts` to load and show all existing blog posts when the page first loads.
    displayPosts(); 
    // Call `setupFormListeners` to configure the form's event handlers.
    setupFormListeners(); 
    // Call `resetForm` to ensure the form starts in a clean "Add Post" state.
    resetForm(); 
}

// Event Listener for `DOMContentLoaded`
// Ensures that the `main` function is executed
// only after the entire HTML document has been completely loaded and parsed by the browser.
document.addEventListener('DOMContentLoaded', main);
