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

