# OVERVIEW

## Purpose  
At my workplace, roster creation has consistently faced challenges. Workers were often scheduled on days they had requested off, shifts frequently overlapped- resulting in overstaffing at some locations or assigning the same person to multiple locations on the same day. Additionally, rosters were often released late due to managerial workload, disrupting employees’ personal plans. To address this, I built a system to manage workers, locations, constraints and availability, and to automatically generate accurate rosters, minimisng human error and improving scheduling efficiency.

## Project Overview  
OPTIROSTER is a full stack project developed entirely from scratch.It utilises CRUD API requests to manage and store data related to workers, locations, days off, worker constraints, permanent restrictions, and occupancies in a MySQL database. This data is then compiled to automatically generate rosters that assign workers to shifts while honoring their availability and restrictions.

## Technologies Used  
 - Frontend:        HTML, CSS,Vanilla Javascript
 - Backend:         Go(Golang)
 - Database:        MySQL
 - APIS:            Custom REST API
 - Architecture:    MVC inspired project structure

## Getting Started
Follow these steps to set up the project locally:

### 1. Clone the repository 
```bash
git clone https://github.com/Siahking/Software-development-Final-Project--incomplete.git
cd Software-development-Final-Project--incomplete
```
---

## 2. Create a `.env` file in the project root(the same folder as `main.go`) with the following content:

```env
DB_USER=app_user
DB_PASSWORD=R0sterProjectDatabase
DB_NAME=roster
DB_HOST=127.0.0.1
DB_PORT=3306
```

Do not commit your `.env` file to Github.

(Optional best practice: include a `.env.example` file in the repository with placeholder values.)

---

## 3. Install Dependecies

```bash
go mod tidy
```

---

## 4. Ensure MySQL Is Running
- Make sure mySQL is installed and running.
- Ensure the database defined in `DB_NAME` exists.
- The user defined in `DB_USER` must have proper priviledges.

---

## 5. Run the Application

```bash
go run main.go
```

The backend server will start on:

```
http://localhost:8080
```

---

## Key Features  
 - Create update and delete workers and locations
 - Define days off, availably constraints and permanent time restrictions
 - Automatically generates rosters that:
   - assign workers to shifts
   - respect all defined unavailability rules
   - detect and alert insufficient staffing 
 - dynamic frontend with real-time user feedback
 - Modular well organize codebase with clear separation of concerns

## Directory Structure  
 - **Css**
   Contains all stylesheets, including a main file for shared styles across all pages.

 - **Database**	
   Includes the database schema used to define and structure data.

 - **HTML**
   Contains all HTML templates for rendering the user interface

 - **Models**
   Contains backend logic for database access and route definitions

 - **Views**		
   Handles all data processing logic and client data delivery. Includes shared helper utilities and feature-specific view logic.

 - **Main.go**
   The entry point for compiling and launching the backend server.

## Views
 - **Backend**	
   Connects the client to the backend endpoints and performs error checking proper CRUD operations.

 - **General helper funcs**	
   Shared utility functions shared across multiple view modules.

 - **Subdirectories in views**
   Each feature based subdirectory (e.g workers, locations, etc) includes:

   - main.js		
	Sets up event listeners for UI interactions like button clicks and form submissions.

   - frontend.js
    Manages UI behaviour, such as showing/hiding elements or updating content dynamically.

   - functions.js
    Handles backend logic, including API communication and error handling.

 - **Roster module(example)**
   - functions.js
    Processes data from the backend and implements roster assignment logic

   - frontend.js
    Displays the calendar interface and populates it with shift data.

## Webpages
 - **Create Roster**
   Allows the user to select a future month, year, and location to dynamically generate a roster.

 - **Workers**
   Displays all workers stored in the database,including their assigned locations.
   Features:
    - Add Worker
        - Inputs:First name *(required)*, Middle Name, Last Name *(required)*,     Gender, Address *(required)*, Age *(required)*, Contact, ID Number *(required)*, Availability *(required)*,Assigned Locations *(required)*
        - Creates a new worker entry.
    - Find Worker
        - Search by ID, ID Number, First Name, Last Name, or Middle Name

 - **Locations**
   Displays all stored locations.
   Features:
    - Add Location
        - Inputs:Location Name
        - Creates a new location
    - Find Location
        - Search by location name

 - **Constraints**
   Displays all stored worker constraints.
   Features:
    - Add Constraint
        - Inputs: Worker 1 ID *(required)*, Worker 2 ID *(required)*, Summary
        - Creates a new constraint indicating why the two workers shouldn't be scheduled together.
    - Find Constraint
        - Search using first/last name of Worker 1 and/or Worker 2
    - Edit Constraint
        - Inputs: Constraint ID, fields to be updated (Worker 1 ID, Worker 2 ID, or Summary)

 - **Days Off & Restrictions**
   Displays both temporary and permanent days off.
   Features:
    - Add Days Off
        - Inputs: Worker ID, Start Date, End Date
        - Creates a temporary day-off record
    - Find Days Off
        - Search by Worker ID or Break ID
    - Add Restriction
        - Inputs: Worker ID, Day of Week, (Optional) Start Time, End Time
        - Creates a permanent restriction
    - Find Restriction
        - Search by restriction ID or Worker ID.edit

