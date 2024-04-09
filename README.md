# High Fidelity Discord Clone | MERN

This is a **humble effort** towards **reproducing the fun discord experience**. Sticking closely to its design philosophy, I have tried **replicating most of the core standard features** to the best of my abilities.

<p align="center">
  <a href="https://discord-clone-react-yvdm.vercel.app/"><img src="/assets/main.png"/></a>
</p>

## What does it do?

This clone (for now) **recreates just** the core functionality **that is expected from a chat platform, such as Discord**.

- **Create** and **manage servers**.
- **Join servers** via invite links & leave servers.
- Have **text conversations**, **audio & video calls**.
- Have a direct one-on-one chat in **real-time**.
- **Customize** your **profile**, add, and remove avatar.
- Moderation tools: **promote and kick members**

While it is still an early work-in-progress, the goal is to continue expanding until I am motivated enough.

## Why does it exist?

This, in no way, as if it could, is made to replace the OG Discord experience. Neither is it here because I am so done with the original one that I decided to build my own.

It’s only here because I wanted to learn and build a real thing. So this became my **first ever real personal project** (not counting a calculator, a todo app, or a tic-tac-toe that you anyways make).

## The Technical Side

A quick overview of the project's technical specifications, for those who are into technicalities. Details along with the decision-making approach are further down below, not to bore people right away.

- A **stateless-stateful hybrid** authentication system using **JWT**.
- A **redux-style** state management using **Context-API & useReducer**
- **Socket.io** for **real-time chat** events
- **Zustand** for managing modals (It was not needed, but wanted to give it a try)
- Raw **Caching** using React (Eyes on Redis though)
- **Shadcn UI** for convenient components
- **Tailwind** for styling
- **Search-debouncing** for search efficiency
- **Intersection-Observer** for **infinite-scrolling and pagination**
- **Zod** for Form Validation
- **Mongoose** for Schema Management & **MongoDB**

### How does the code look?

- **Modular components** - organized logically throughout various sub-folders. Well, honestly, a few are still waiting in line to be modularized.
- Components adhere to the **SRP (Single Responsibility Principle)**.
- **Neatly documented code** tells exactly what’s going on.
- **Robust error handling** to avoid awkward runtime errors and crashes.
- **Security measures** such as **well-thought-out authentication**, **HTTP-only cookies**, input validation, **double-validation (on both the client and server side)**, **no storing sensitive data on local storage**, etc. have been maintained.
- **Code abstraction** wherever required
- **Scalable – APIs** are written with scalability in mind.

## Dive Deeper

Since I don’t have a dedicated website just yet to document everything, below is a modest effort to take you through the code.

### Authentication Flow

As shown in the **flow chart**, the authentication design closely resembles a **typical JWT-based flow**. However, **certain additional checks are added to make JWTs more secure**, such as:

- **Not using a refresh_token** if the access_token is missing, invalid, or has been forged with.
- **Only using refresh_token when** the access_token comes clean but is expired.
- **Database lookup** before using a refresh_token to issue a new access_token.

<p align="center">
  <img src="/assets/authFlow.jpg" />
</p>

A **database lookup** before issuing a new access_token **is critical to let users invalidate sessions**. Since JWTs are stateless, there is no way to invalidate them until expiration. With a stolen refresh_token, an attacker could keep issuing new access_tokens indefinitely.

However, **requiring a database call to verify the refresh_token before issuing new access_token allows immediate session invalidation by deleting the refresh_token from the database**. This limits attacker access until the stolen access_token expires, typically in just a few minutes.

### Context Management

The application relies heavily on context, whether it be a typical Auth-Context or a custom Servers-Context. **Instead of letting a single Global context handle everything**, thereby introducing the **God-Object problem**, **various smaller sub-contexts are used**, each minding their own business.

<p align="center">
  <img src="/assets/conHi.jpg" />
</p>

- This **increases performance**; now state change inside a nested-child context **won’t trigger a re-render** to its parent context.
- **Decreases memorizing overhead**; components that don't rely on a nested context won’t be wrapped by it, thereby not having to memoize them to prevent re-render when a particular context variable changes.

### Modularity

A **"type"-based conditional rendering** has been set, where the **same components render different components or the same components differently based on the “type” provided**. This increases reusability; just pass a different “type” with different props (wherever required) and you have a whole new page.

<p align="center">
  <img src="/assets/modularType.jpg" />
</p>

```
<div>
       {type === "conversation" ?
         <MainWrapper type={type} mainData={activeConversation} />
        :
         <MainWrapper type={type} mainData={activeChannel} />
       }
</div>
```

## Repo Guide

Here’s a guide for you if you would like to clone it/ test it / fork it or extend upon it.

### Project Structure and Naming Convention

Since **I was the only one working on this project**, and due to the project's complex nature, **I chose not to stick to a standard naming convention** but instead **devised my own** to suit my personal needs.

The API (i.e., server-side code) is self-explanatory, as it follows standards as closely as possible; however, the client side has been customized.

- **Camel case for general components**, i.e., conversationHeader.jsx
- **Kebab case for utils / helpers / providers**, e.g., context-helper.js
- **Camel case prefixed with “use” for hooks**, e.g., useAuth.jsx, useServer.jsx
- **Pascal case suffixed with “Page” for pages**, MainPage.jsx, HomePage.jsx
- **Kebab + Capitals** for other important components such as Modals, Contexts etc.
- **Pascal case for App.jsx**, as App.jsx is different from other components.

### Organizing Files

The project closely follows the standard structure that is typically used in most React projects. **The “components” folder that is anyways open for developers personalization has been used to set a logical, consistent, and helpful structure**.

```
root
│
├── api
│ ├── bin
│ ├── controllers
│ ├── middlewares
│ ├── modals
│ ├── public
│ ├── routes
│ ├── socket
│ ├── utils
│


├── client
│ ├── src
│ │ ├── components
│ │ │
│ │ │ ├── server // Comp. for the server page
│ │ │ │ ├── header // Header
│ │ │ │ ├── sidebar // Switching channels & server actions
│ │ │ │ │ └── dropdownMenu // User actions - leave server, etc
│ │ │ │
│ │ │ ├── conversation // Comp. for the conversations page
│ │ │ │ ├── header // Header
│ │ │ │ ├── sidebar // Switch conversations, etc
│ │ │ │
│ │ │ ├── main // Wrapper for main page content
│ │ │ ├── messages // Displayed messages on mainPage
│ │ │ ├── navigation // The leftmost main nav. pane
│
```

### Naming files

**Each file within a folder is prefixed** with the **respective folder name** to make them more readable, e.g., messageWelcome.jsx inside the "message" folder.

<p align="center">
  <img src="/assets/namingFiles.png" />
</p>

Each folder has its own either one or two main components that are responsible for wrapping others to create a final piece of UI. **These main components are named based on what they eventually produce**, e.g., conversationHeader.jsx will produce a header for the conversation pane.

## Install Locally

### Clone Repository

```shell
git clone https://github.com/sahilsGit/discordCloneReact.git
```

### Install Packages

```shell
cd discordCloneReact
```

```shell
cd api
```

```shell
npm install
```

```shell
cd ..
```

```shell
cd client
```

```shell
npm install
```

## Available commands

Running commands with npm `npm [command]`

| command   | description                          | use inside |
| :-------- | :----------------------------------- | :--------- |
| `run dev` | Starts a client development instance | `/client`  |
| `start`   | Starts a server development instance | `/api`     |
