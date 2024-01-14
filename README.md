root
│
├── api
│ ├── bin // Database connection
│ ├── controllers
│ ├── middlewares
│ ├── modals
│ ├── public
│ ├── routes
│ ├── socket // WebSocket-related logic
│ ├── utils // Utility functions and constants
│
├── client
│ ├── src
│ │ ├── components
│ │ │
│ │ │ ├── server // Components for the server page
│ │ │ │ ├── header // Header for the server page
│ │ │ │ ├── sidebar // Sidebar for switching channels and server actions
│ │ │ │ │ └── dropdownMenu // User actions (e.g., Leave server, invite friends)
│ │ │ │
│ │ │ ├── conversation // Components for the conversations page
│ │ │ │ ├── header // Header for the conversation page
│ │ │ │ ├── sidebar // Sidebar for switching conversations
│ │ │ │
│ │ │ ├── main // Wrapper for server and conversation page content
│ │ │ ├── messages // Displayed messages on server/conversation pages
│ │ │ ├── navigation // The leftmost main nav. pane
│
