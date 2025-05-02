import React from "react";

export default function About(){
    return(
        <>       
        <div class="container mt-4">
                <h2>🌟 Welcome to the "Contact Manager" Application! 🌟</h2>
                <p>This app provides a comprehensive solution for <strong>managing contacts</strong> and <strong>storing data</strong>. The user interface is simple, clean, and modern, ensuring that the most important information is always at your fingertips.</p>

                <h4>📱 <strong>Why is it great?</strong></h4>
                <ul>
                    <li><strong>Flexible data management:</strong> The app allows for easy addition, modification, and deletion of contact information.</li>
                    <li><strong>Profile picture support:</strong> You can personalize each contact with a unique profile picture, uploaded from your own avatar, making it easier to identify contacts.</li>
                    <li><strong>Export options:</strong> You can download the saved contacts as JSON or vCards.</li>
                    <li><strong>Dynamic interactions:</strong> The easy-to-use interface and quick data updates ensure a smooth and responsive user experience.</li>
                </ul>

                <h4>🖥️ <strong>Development & Technology</strong></h4>
                <p>This app is built with <strong>React.js</strong> for the frontend and <strong>Node.js</strong> for the backend, with a powerful <strong>PostgreSQL</strong> database handling data in the background. User data is securely stored, and the application implements <strong>JWT-based authentication</strong> for a safe and reliable operation.</p>

                <h4>⚙️ <strong>Portfolio Purpose</strong></h4>
                <p>This project is not just a simple app, but also a showcase of my development skills. It demonstrates how modern web technologies can be used to create a fully functional, secure, and interactive system. The app’s goal is to provide users with an intuitive and easy-to-manage platform for organizing their contacts.</p>

                <h4>🔧 <strong>Technologies Used:</strong></h4>
                <ul>
                    <li><strong>Frontend:</strong> React.js, CSS, Bootstrap</li>
                    <li><strong>Backend:</strong> Node.js, Express.js</li>
                    <li><strong>Database:</strong> PostgreSQL</li>
                    <li><strong>File Management:</strong> Multer (secure file storage and handling)</li>
                    <li><strong>Authentication:</strong> JWT (JSON Web Token) security</li>
                </ul>

                <h4>🔧 <strong>Next steps: (further development)</strong></h4>
                <ul>
                    <li><strong>Multiple contacts management: </strong>Download or delete more cotnacts at a time</li>           
                    <li><strong>Import options:</strong>Import contacts from JSON </li>
                </ul>
            </div>
        </>
    );
}