package models

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	//Serve static files
	router.Static("/css", "./css")
	router.Static("/views", "./views")
	router.Static("/controllers","./controllers")
	
	router.LoadHTMLGlob("html/*.html")

	// HTML Routes
	htmlRoutes(router)

	// API Routes
	apiRouter(router, db)
}

func htmlRoutes(router *gin.Engine) {
	// routes for html pages
	router.GET("/", func(c *gin.Context) { //homepage
		c.HTML(http.StatusOK, "home.html", nil)
	})
	router.GET("/find-locations", func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-locations.html", nil)
	})
	router.GET("/get-workers", func(c *gin.Context) {
		c.HTML(http.StatusOK, "workers.html", nil)
	})
	router.GET("/find-workers", func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-workers.html", nil)
	})
	router.GET("/get-locations", func(c *gin.Context) {
		c.HTML(http.StatusOK, "locations.html", nil)
	})
	router.GET("/constraints", func(c *gin.Context) {
		c.HTML(http.StatusOK, "constraints.html", nil)
	})
	router.GET("/find-contraints",func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-constraints.html",nil)
	})
	router.GET("/days-off",func(c *gin.Context) {
		c.HTML(http.StatusOK, "days-off.html",nil)
	})
	router.GET("/find-days-off",func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-days-off.html",nil)
	})
	router.GET("/find-restrictions",func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-restrictions.html",nil)
	})
	router.GET("/create-roster",func(c *gin.Context) {
		c.HTML(http.StatusOK, "create-roster.html",nil)
	})
	router.GET("find-rosters",func(c *gin.Context) {
		c.HTML(http.StatusOK, "find-rosters.html",nil)
	})
}

func apiRouter(router *gin.Engine, db *sql.DB) {
	//delete route
	router.DELETE("delete/:table/:id", func(c *gin.Context) {
		DeleteEntry(c, db)
	})

	//LOCATIONS ROUTES
	//get all locations
	router.GET("/locations", func(c *gin.Context) { //
		GetLocations(c, db)
	})
	//get location by name or id
	router.GET("/locations/:column/:value", func(c *gin.Context) {
		FindLocation(c, db)
	})
	//create a new location
	router.POST("/locations/:location", func(c *gin.Context) {
		AddLocation(c, db)
	})
	//edit location
	router.PATCH("/edit-location/:id", func(c *gin.Context) {
		EditLocation(c, db)
	})

	//WORKER ROUTES
	//get all workers
	router.GET("/workers", func(c *gin.Context) {
		GetWorkers(c, db)
	})
	//find a worker by names,id number or id
	router.GET("/find-worker", func(c *gin.Context) {
		FindWorker(c, db)
	})
	//create a worker
	router.POST("/workers/add-worker", func(c *gin.Context) {
		AddWorker(c, db)
	})
	//edit worker
	router.PATCH("/edit-worker/:id",func(c *gin.Context) {
		EditWorker(c, db)
	})

	//WORKER_LOCATION ROUTES
	//assign a worker to a route
	router.POST("/assign-location/:worker_id/:location_id", func(c *gin.Context) {
		AssignWorkerToLocation(c, db)
	})
	//get the association between a worker and a location
	router.GET("/get-worker-location-connections/:column/:id", func(c *gin.Context) {
		GetWorkerLocationConnections(c, db)
	})
	//remove a worker from a location
	router.DELETE("/remove-connection", func(c *gin.Context) {
		RemoveConnection(c, db)
	})
	//edit worker or location in connection
	router.PATCH("edit-connection/:id", func(c *gin.Context){
		EditConnection(c, db)
	})

	//CONTRAINTS ROUTES
	//create a constraint
	router.POST("/create-constraint", func(c *gin.Context){
		CreateConstrant(c, db)
	})
	//find a constraint
	router.GET("/find-constraints", func(c *gin.Context) {
		FindConstraint(c, db)
	})
	//modify a constraint
	router.PATCH("/edit-constraints/:id", func(c *gin.Context) {
		EditConstraints(c, db)
	})
	//delete a constraint
	router.DELETE("/delete-constraint/:id", func(c *gin.Context) {
		DeleteConstraint(c, db)
	})

	//DAYS OFF ROUTES
	//create days off
	router.POST("/add-days-off", func(c *gin.Context) {
		AddDaysOff(c, db)
	})
	//get days off by column or value
	router.GET("/get-days-off/:column/:value", func(c *gin.Context) {
		GetDaysOff(c, db)
	})
	//get all days off
	router.GET("/get-days-off", func(c *gin.Context) {
		GetDaysOff(c, db)
	})
	//delete days off by id
	router.DELETE("remove-days/:id", func(c *gin.Context) {
		RemoveDaysOff(c, db)
	})
	//edit days off
	router.PATCH("edit-dayoff/:id", func(c *gin.Context) {
		EditDayOff(c, db)
	})

	//restriction routes
	//create a new restriction
	router.POST("/create-restriction", func(c *gin.Context) {
		CreatePermanentRestriction(c, db)
	})
	//get all restrictions
	router.GET("/get-restrictions", func(c *gin.Context) {
		GetRestrictions(c, db)
	})
	//find restrictions using data
	router.GET("/find-restriction/:column/:id", func(c *gin.Context) {
		FindRestriction(c,db)
	})
	//delete restriction
	router.DELETE("/delete-restriction/:id",func(c *gin.Context) {
		DeleteRestriction(c,db)
	})
	//edit restirction
	router.PATCH("edit-restriction/:id",func(c *gin.Context) {
		EditRestriction(c,db)
	})

	//occupancy routes
	//create a new occupancy
	router.POST("/create-occupancy",func(c *gin.Context) {
		CreateNewOccupancy(c,db)
	})
	//retrieve all occupancies
	router.GET("/retrieve-occupancies",func(c *gin.Context) {
		RetrieveOccupancies(c,db)
	})
	//delete occuoancies
	router.DELETE("/delete-occupancy/:id",func(c *gin.Context) {
		RemoveOccupancy(c,db)
	})
	//delete all occupancies
	router.DELETE("/clear-occupancies",func(c *gin.Context) {
		EmptyOccupancies(c,db)
	})

	//find worker data for locations of find locations data for workers
	router.GET("/retrieve-workers-locations/:column/:id",func(c *gin.Context) {
		RetrieveWorkersOrLocation(c,db)
	})

	//roster endpoints
	//save a roster
	router.POST("/save-roster", func(c *gin.Context) {
		SaveRoster(c,db)
	})
	//retrieve rosters
	router.GET("/retrieve-rosters", func(c *gin.Context) {
		RetrieveRosters(c,db)
	})
	//edit roster
	router.PATCH("/edit-roster/:id", func(c *gin.Context){
		EditRoster(c,db)
	})
	//delete roster
	router.DELETE("/delete-roster", func(c *gin.Context){
		DeleteRoster(c,db)
	})

	//roster entries routes
	//create entry
	router.POST("/roster-entry", func(c *gin.Context){
		RosterEntryHandler(c,db)
	})
	//retrieve roster entries
	router.GET("/retrieve-entry", func(c *gin.Context){
		RetrieveRosterEntries(c,db)
	})
	//edit roster entries
	router.PATCH("/edit-entry/:id",func(c *gin.Context){
		EditRosterEntry(c,db)
	})
	//delete roster entry
	router.DELETE("/delete-entry", func(c *gin.Context){
		DeleteRosterEntry(c,db)
	})

	//account routes
	//create account
	router.POST("/create-account",func(c *gin.Context){
		CreateAccount(c,db)
	})
	//retrieve accounts
	router.GET("/retrieve-account", func(c *gin.Context){
		RetrieveAccounts(c,db)
	})
	//edit accounts
	router.PATCH("/edit-account/:id", func(c *gin.Context){
		EditAccount(c,db)
	})
	//delete account
	router.DELETE("/delete-account", func(c *gin.Context){
		DeleteAccount(c,db)
	})
}
