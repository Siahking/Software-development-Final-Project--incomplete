package models

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	//Serve static files
	router.Static("/static", "./static")
	router.Static("/views", "./views")
	router.Static("/controllers","./controllers")
	
	router.LoadHTMLGlob("templates/*.html")

	// HTML Routes
	htmlRoutes(router)

	// API Routes
	apiRouter(router, db)
}

func htmlRoutes(router *gin.Engine) {
	// routes for html pages
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "home.html", nil)
	})
	router.GET("/create-roster", func(c *gin.Context) {
		c.HTML(http.StatusOK, "create-roster.html", nil)
	})
	router.GET("/add-worker", func(c *gin.Context) {
		c.HTML(http.StatusOK, "add-worker.html", nil)
	})
	router.GET("/remove-worker", func(c *gin.Context) {
		c.HTML(http.StatusOK, "remove-worker.html", nil)
	})
	router.GET("/remove-location", func(c *gin.Context) {
		c.HTML(http.StatusOK, "remove-location.html", nil)
	})
	router.GET("/get-workers", func(c *gin.Context) {
		c.HTML(http.StatusOK, "get-workers.html", nil)
	})
	router.GET("/worker-details", func(c *gin.Context) {
		c.HTML(http.StatusOK, "worker-details.html", nil)
	})
	router.GET("/get-locations", func(c *gin.Context) {
		c.HTML(http.StatusOK, "get-locations.html", nil)
	})
	router.GET("/constraints", func(c *gin.Context) {
		c.HTML(http.StatusOK, "constraints.html", nil)
	})
}

func apiRouter(router *gin.Engine, db *sql.DB) {
	//delete route
	router.DELETE("delete/:table/:id", func(c *gin.Context) {
		DeleteEntry(c, db)
	})

	//location_routes
	router.GET("/locations", func(c *gin.Context) { //
		GetLocations(c, db)
	})
	router.GET("/locations/:column/:value", func(c *gin.Context) {
		FindLocation(c, db)
	})
	router.POST("/locations/:location", func(c *gin.Context) {
		AddLocation(c, db)
	})

	//worker_routes
	router.GET("/workers", func(c *gin.Context) {
		GetWorkers(c, db)
	})
	router.GET("/find-worker", func(c *gin.Context) {
		FindWorker(c, db)
	})
	router.POST("/workers/add-worker", func(c *gin.Context) {
		AddWorker(c, db)
	})

	//worker_location routes
	router.POST("/assign-location/:worker_id/:location_id", func(c *gin.Context) {
		AssignWorkerToLocation(c, db)
	})
	router.GET("/get-worker-location-connections/:column/:id", func(c *gin.Context) {
		GetWorkerLocationConnections(c, db)
	})
	router.DELETE("/remove-connection/:column/:id", func(c *gin.Context) {
		RemoveConnection(c, db)
	})

	//constraint routes
	router.GET("/find-constraints", func(c *gin.Context) {
		FindConstraint(c, db)
	})
	router.POST("/edit-constraints/:changes/:id", func(c *gin.Context) {
		EditConstraints(c, db)
	})
	router.DELETE("/delete-constraint/:id", func(c *gin.Context) {
		DeleteConstraint(c, db)
	})

	//days off routes
	router.POST("/add-days-off", func(c *gin.Context) {
		AddDaysOff(c, db)
	})
	router.GET("/get-days-off/:column/:value", func(c *gin.Context) {
		GetDaysOff(c, db)
	})
	router.GET("/get-days-off", func(c *gin.Context) {
		GetDaysOff(c, db)
	})
	router.DELETE("remove-days/:id", func(c *gin.Context) {
		RemoveDaysOff(c, db)
	})
}
